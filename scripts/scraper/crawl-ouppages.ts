import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { loadEnvConfig } from "@next/env";
import { chromium } from "playwright";
import { extractFromPage, isInternalUrl, normalizeUrl } from "./extract-content";
import { ScrapeRepository } from "./supabase-ingest";
import type { ScrapeCounters, ScraperSeedConfig } from "./types";

type QueueItem = {
  url: string;
  depth: number;
};

const DEFAULT_SEED_PATH = path.resolve(process.cwd(), "scripts/scraper/seeds/oup-intermediate3.json");
const DEFAULT_STORAGE_STATE_PATH = path.resolve(
  process.cwd(),
  "scripts/scraper/.auth/oup-storage-state.json",
);
const NON_HTML_EXTENSIONS = [".pdf", ".zip", ".mp3", ".mp4", ".png", ".jpg", ".jpeg", ".webp", ".gif"];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(argv: string[]) {
  const args = new Set(argv);
  return {
    login: args.has("--login"),
    headful: args.has("--headful"),
    seedPath:
      argv.find((value) => value.startsWith("--seed="))?.replace("--seed=", "") ?? DEFAULT_SEED_PATH,
    storageStatePath:
      argv.find((value) => value.startsWith("--state="))?.replace("--state=", "") ?? DEFAULT_STORAGE_STATE_PATH,
  };
}

async function readSeedConfig(seedPath: string): Promise<ScraperSeedConfig> {
  const raw = await readFile(seedPath, "utf-8");
  const parsed = JSON.parse(raw) as ScraperSeedConfig;

  if (!parsed.startUrls?.length) {
    throw new Error("Arquivo de seed invalido: startUrls vazio.");
  }

  return parsed;
}

function isPathAllowed(url: string, allowedPathPrefixes: string[]): boolean {
  const pathname = new URL(url).pathname;
  return allowedPathPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isLikelyNonHtmlDocument(url: string): boolean {
  const pathname = new URL(url).pathname.toLowerCase();
  return NON_HTML_EXTENSIONS.some((extension) => pathname.endsWith(extension));
}

async function ensureStorageState(seedUrl: string, stateFilePath: string, forceLogin: boolean): Promise<void> {
  let hasState = false;
  try {
    await stat(stateFilePath);
    hasState = true;
  } catch {
    hasState = false;
  }

  if (hasState && !forceLogin) {
    return;
  }

  await mkdir(path.dirname(stateFilePath), { recursive: true });
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(seedUrl, { waitUntil: "domcontentloaded" });
  console.log("Conclua o login/desafio anti-bot na janela aberta.");
  console.log("Quando terminar, volte ao terminal e pressione ENTER para salvar a sessao.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  await rl.question("");
  rl.close();

  await context.storageState({ path: stateFilePath });
  await browser.close();
}

async function main() {
  loadEnvConfig(process.cwd());

  const args = parseArgs(process.argv.slice(2));
  const config = await readSeedConfig(args.seedPath);

  await ensureStorageState(config.startUrls[0], args.storageStatePath, args.login);
  if (args.login) {
    console.log("Sessao salva com sucesso.");
    return;
  }

  const repository = new ScrapeRepository();

  const runId = await repository.createRun(config.name, config.startUrls.length);
  const counters: ScrapeCounters = {
    okCount: 0,
    blockedCount: 0,
    errorCount: 0,
    changedCount: 0,
    unchangedCount: 0,
    ignoredCount: 0,
  };

  const visited = new Set<string>();
  const queued = new Set<string>();
  const queue: QueueItem[] = config.startUrls.map((url) => ({ url: normalizeUrl(url), depth: 0 }));

  queue.forEach((item) => queued.add(item.url));

  const browser = await chromium.launch({ headless: !args.headful });
  const context = await browser.newContext({ storageState: args.storageStatePath });
  const page = await context.newPage();

  try {
    while (queue.length > 0 && visited.size < config.maxPages) {
      const current = queue.shift();
      if (!current) {
        break;
      }

      if (visited.has(current.url)) {
        continue;
      }

      visited.add(current.url);

      if (isLikelyNonHtmlDocument(current.url)) {
        counters.ignoredCount += 1;
        continue;
      }

      console.log(`[${visited.size}] Coletando: ${current.url}`);

      try {
        const response = await page.goto(current.url, { waitUntil: "domcontentloaded", timeout: 60000 });
        const httpStatus = response?.status() ?? null;
        const html = await page.content();

        const blocked =
          httpStatus === 401 ||
          httpStatus === 403 ||
          html.toLowerCase().includes("verify that you're not a robot") ||
          html.toLowerCase().includes("enable javascript and then reload") ||
          page.url().toLowerCase().includes("captcha");

        if (blocked) {
          counters.blockedCount += 1;
          await repository.persistPage({
            runId,
            status: "blocked",
            httpStatus,
            page: {
              url: current.url,
              urlNormalized: current.url,
              canonicalUrl: null,
              title: null,
              h1: null,
              contentText: "",
              contentHtml: "",
              contentHash: "",
              links: [],
              assets: [],
              sessions: [],
              metadata: { reason: "anti-bot-or-js-challenge" },
            },
          });
          continue;
        }

        const extracted = await extractFromPage(page, current.url, config.allowedDomains);
        const saveResult = await repository.persistPage({
          runId,
          status: "success",
          httpStatus,
          page: extracted,
        });

        counters.okCount += 1;
        if (saveResult.isUnchangedVersion) {
          counters.unchangedCount += 1;
        } else {
          counters.changedCount += 1;
        }

        if (current.depth >= config.maxDepth) {
          continue;
        }

        for (const link of extracted.links) {
          if (!link.isInternal) {
            continue;
          }

          if (!isInternalUrl(link.href, config.allowedDomains)) {
            continue;
          }

          if (!isPathAllowed(link.href, config.allowedPathPrefixes)) {
            counters.ignoredCount += 1;
            continue;
          }

          if (isLikelyNonHtmlDocument(link.href)) {
            counters.ignoredCount += 1;
            continue;
          }

          if (!queued.has(link.href) && !visited.has(link.href)) {
            queue.push({ url: link.href, depth: current.depth + 1 });
            queued.add(link.href);
          }
        }
      } catch (error) {
        counters.errorCount += 1;
        await repository.persistPage({
          runId,
          status: "error",
          httpStatus: null,
          errorMessage: error instanceof Error ? error.message : "Erro desconhecido",
          page: {
            url: current.url,
            urlNormalized: current.url,
            canonicalUrl: null,
            title: null,
            h1: null,
            contentText: "",
            contentHtml: "",
            contentHash: "",
            links: [],
            assets: [],
            sessions: [],
            metadata: { reason: "runtime_error" },
          },
        });
      }

      await sleep(config.requestDelayMs);
    }
  } finally {
    await repository.finishRun(runId, counters);
    await browser.close();
  }

  console.log("");
  console.log("Scraping finalizado");
  console.log(`run_id=${runId}`);
  console.log(`ok=${counters.okCount}`);
  console.log(`blocked=${counters.blockedCount}`);
  console.log(`error=${counters.errorCount}`);
  console.log(`changed=${counters.changedCount}`);
  console.log(`unchanged=${counters.unchangedCount}`);
  console.log(`ignored=${counters.ignoredCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
