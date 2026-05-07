import { createHash } from "node:crypto";
import type { Page } from "playwright";
import type {
  ExtractedAsset,
  ExtractedExercise,
  ExtractedOption,
  ExtractedPagePayload,
  ExtractedQuestion,
  ExtractedSession,
} from "./types";

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl);
  parsed.hash = "";

  if (parsed.pathname.endsWith("/") && parsed.pathname !== "/") {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }

  return parsed.toString();
}

export function isInternalUrl(url: string, allowedDomains: string[]): boolean {
  const hostname = new URL(url).hostname.toLowerCase();
  return allowedDomains.some((domain) => {
    const normalizedDomain = domain.toLowerCase();
    return hostname === normalizedDomain || hostname.endsWith(`.${normalizedDomain}`);
  });
}

export function computeContentHash(contentText: string): string {
  return createHash("sha256").update(contentText).digest("hex");
}

type PassCapture = {
  canonicalUrl: string | null;
  title: string;
  h1: string;
  contentText: string;
  contentHtml: string;
  links: Array<{ href: string; text: string }>;
  assets: ExtractedAsset[];
  sessions: ExtractedSession[];
  iframeEmbeds: Array<{ src: string | null; title: string | null }>;
  userAgent: string;
  lang: string | null;
};

function mergeUniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function mergeAssets(base: ExtractedAsset[], extra: ExtractedAsset[]): ExtractedAsset[] {
  const map = new Map<string, ExtractedAsset>();
  for (const asset of [...base, ...extra]) {
    const key = `${asset.assetType}:${asset.assetUrl}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, asset);
      continue;
    }
    map.set(key, {
      ...existing,
      altText: existing.altText || asset.altText,
      title: existing.title || asset.title,
      mimeType: existing.mimeType || asset.mimeType,
      width: existing.width ?? asset.width,
      height: existing.height ?? asset.height,
      sourcePass: "merged",
      metadata: { ...existing.metadata, ...asset.metadata },
    });
  }
  return Array.from(map.values()).sort((a, b) => a.assetUrl.localeCompare(b.assetUrl));
}

function mergeOptions(base: ExtractedOption[], extra: ExtractedOption[]): ExtractedOption[] {
  const map = new Map<string, ExtractedOption>();
  for (const option of [...base, ...extra]) {
    const existing = map.get(option.externalKey);
    if (!existing) {
      map.set(option.externalKey, option);
      continue;
    }

    map.set(option.externalKey, {
      ...existing,
      optionText: existing.optionText || option.optionText,
      optionHtml: existing.optionHtml || option.optionHtml,
      isCorrect: existing.isCorrect || option.isCorrect,
      metadata: { ...existing.metadata, ...option.metadata },
    });
  }

  return Array.from(map.values()).sort((a, b) => a.ordem - b.ordem);
}

function mergeQuestions(base: ExtractedQuestion[], extra: ExtractedQuestion[]): ExtractedQuestion[] {
  const map = new Map<string, ExtractedQuestion>();
  for (const question of [...base, ...extra]) {
    const existing = map.get(question.externalKey);
    if (!existing) {
      map.set(question.externalKey, question);
      continue;
    }

    map.set(question.externalKey, {
      ...existing,
      promptText: existing.promptText || question.promptText,
      promptHtml: existing.promptHtml || question.promptHtml,
      points: existing.points ?? question.points,
      answerKeys: mergeUniqueStrings([...existing.answerKeys, ...question.answerKeys]),
      options: mergeOptions(existing.options, question.options),
      metadata: { ...existing.metadata, ...question.metadata },
    });
  }

  return Array.from(map.values()).sort((a, b) => a.ordem - b.ordem);
}

function mergeExercises(base: ExtractedExercise[], extra: ExtractedExercise[]): ExtractedExercise[] {
  const map = new Map<string, ExtractedExercise>();
  for (const exercise of [...base, ...extra]) {
    const existing = map.get(exercise.externalKey);
    if (!existing) {
      map.set(exercise.externalKey, exercise);
      continue;
    }

    map.set(exercise.externalKey, {
      ...existing,
      title: existing.title || exercise.title,
      instruction: existing.instruction || exercise.instruction,
      questions: mergeQuestions(existing.questions, exercise.questions),
      metadata: { ...existing.metadata, ...exercise.metadata },
    });
  }

  return Array.from(map.values()).sort((a, b) => a.ordem - b.ordem);
}

function mergeSessions(base: ExtractedSession[], extra: ExtractedSession[]): ExtractedSession[] {
  const map = new Map<string, ExtractedSession>();
  for (const session of [...base, ...extra]) {
    const existing = map.get(session.externalKey);
    if (!existing) {
      map.set(session.externalKey, session);
      continue;
    }

    map.set(session.externalKey, {
      ...existing,
      title: existing.title || session.title,
      description: existing.description || session.description,
      sourcePass: "merged",
      exercises: mergeExercises(existing.exercises, session.exercises),
      metadata: { ...existing.metadata, ...session.metadata },
    });
  }

  return Array.from(map.values()).sort((a, b) => a.ordem - b.ordem);
}

async function runInteractivePass(page: Page): Promise<string[]> {
  const clicked = await page.evaluate(async () => {
    const clickedSelectors: string[] = [];

    const controls = Array.from(
      document.querySelectorAll<HTMLElement>(
        "button, summary, [role='button'], [aria-expanded='false'], [data-action], .accordion-toggle, [role='tab']",
      ),
    ).slice(0, 120);

    for (const control of controls) {
      const style = window.getComputedStyle(control);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        control.offsetParent === null ||
        control.hasAttribute("disabled")
      ) {
        continue;
      }

      const text = (control.textContent || "").toLowerCase();
      const shouldClick =
        /show|answer|solution|check|expand|open|reveal|tab|next|continue|more/.test(text) ||
        control.hasAttribute("aria-controls") ||
        control.hasAttribute("data-action");

      if (!shouldClick) {
        continue;
      }

      const selectorHint =
        control.id ||
        control.getAttribute("data-testid") ||
        control.getAttribute("data-action") ||
        control.className ||
        control.tagName.toLowerCase();

      control.click();
      clickedSelectors.push(selectorHint || "control");
      await new Promise((resolve) => setTimeout(resolve, 60));
    }

    return clickedSelectors;
  });

  await page.waitForTimeout(700);
  return clicked;
}

function buildStructuredSessions(
  contentHtml: string,
  contentText: string,
  sourcePass: "visible_dom" | "interactive" | "merged",
): ExtractedSession[] {
  const headingMatches = Array.from(contentHtml.matchAll(/<(h1|h2|h3|h4)[^>]*>(.*?)<\/\1>/gims));
  const textLines = contentText
    .split(/[\r\n]+/)
    .map((line) => normalizeWhitespace(line))
    .filter((line) => line.length > 0);

  const fallbackQuestionLines = textLines.filter((line) => line.includes("?")).slice(0, 12);
  const optionLikeLines = textLines.filter((line) => /^[A-D][\)\.\-:]/i.test(line)).slice(0, 20);
  const answerLikeLines = textLines
    .filter((line) => /(answer|gabarito|resposta|solution|correct)/i.test(line))
    .slice(0, 10);

  const sessionTitles = headingMatches.length
    ? headingMatches.map((match, index) => ({
        key: `heading-${index + 1}`,
        title: normalizeWhitespace(match[2].replace(/<[^>]+>/g, "")) || `Sessao ${index + 1}`,
      }))
    : [{ key: "overview", title: "Sessao principal" }];

  return sessionTitles.map((session, sessionIndex) => {
    const questions: ExtractedQuestion[] = fallbackQuestionLines.length
      ? fallbackQuestionLines.map((line, index) => ({
          externalKey: `${session.key}-q-${index + 1}`,
          questionType: optionLikeLines.length ? "multiple_choice" : "open",
          promptText: line,
          promptHtml: null,
          points: null,
          ordem: index + 1,
          answerKeys: answerLikeLines,
          options: optionLikeLines.slice(0, 6).map((optionLine, optionIndex) => ({
            externalKey: `${session.key}-q-${index + 1}-opt-${optionIndex + 1}`,
            rotulo: optionLine.charAt(0).toUpperCase(),
            optionText: optionLine,
            optionHtml: null,
            ordem: optionIndex + 1,
            isCorrect: /(correct|resposta|gabarito)/i.test(optionLine),
            metadata: {},
          })),
          metadata: {},
        }))
      : [
          {
            externalKey: `${session.key}-q-1`,
            questionType: "open",
            promptText: textLines[0] || "Pergunta nao identificada automaticamente.",
            promptHtml: null,
            points: null,
            ordem: 1,
            answerKeys: answerLikeLines,
            options: [],
            metadata: {},
          },
        ];

    const exercise: ExtractedExercise = {
      externalKey: `${session.key}-exercise-1`,
      title: session.title,
      instruction: textLines[1] || null,
      exerciseType: optionLikeLines.length ? "multiple_choice" : "reading",
      ordem: 1,
      questions,
      metadata: {},
    };

    return {
      externalKey: session.key,
      title: session.title,
      description: textLines[2] || null,
      sessionType: "study_session",
      ordem: sessionIndex + 1,
      sourcePass,
      exercises: [exercise],
      metadata: {},
    };
  });
}

async function capturePageState(page: Page, sourcePass: "visible_dom" | "interactive"): Promise<PassCapture> {
  const pageData = await page.evaluate((passName) => {
    const mainEl =
      document.querySelector("main") ||
      document.querySelector('[role="main"]') ||
      document.querySelector("#content") ||
      document.querySelector(".content") ||
      document.querySelector("article") ||
      document.body;

    const clonedMain = mainEl.cloneNode(true) as HTMLElement;
    // Mantemos <style> para preservar formatacao original dos exercicios.
    clonedMain.querySelectorAll("script, noscript, svg").forEach((el) => el.remove());

    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).map((a) => ({
      href: a.href,
      text: (a.textContent || "").replace(/\s+/g, " ").trim(),
    }));

    const imageAssets: ExtractedAsset[] = Array.from(
      mainEl.querySelectorAll<HTMLImageElement>("img"),
    )
      .map((img) => ({
        assetUrl: img.currentSrc || img.src || "",
        assetType: "image" as const,
        altText: (img.getAttribute("alt") || "").trim() || null,
        title: (img.getAttribute("title") || "").trim() || null,
        mimeType: null,
        width: Number.isFinite(img.naturalWidth) && img.naturalWidth > 0 ? img.naturalWidth : null,
        height: Number.isFinite(img.naturalHeight) && img.naturalHeight > 0 ? img.naturalHeight : null,
        sourcePass: passName,
        metadata: {
          loading: img.getAttribute("loading"),
          className: img.className || null,
        },
      }))
      .filter((asset) => asset.assetUrl.length > 0);

    const iconAssets: ExtractedAsset[] = Array.from(
      document.querySelectorAll<HTMLLinkElement>("link[rel*='icon'][href]"),
    )
      .map((link) => ({
        assetUrl: link.href,
        assetType: "icon" as const,
        altText: null,
        title: (link.getAttribute("title") || "").trim() || null,
        mimeType: (link.getAttribute("type") || "").trim() || null,
        width: null,
        height: null,
        sourcePass: passName,
        metadata: {
          rel: link.getAttribute("rel"),
          sizes: link.getAttribute("sizes"),
        },
      }))
      .filter((asset) => asset.assetUrl.length > 0);

    const iframeEmbeds = Array.from(mainEl.querySelectorAll<HTMLIFrameElement>("iframe")).map((iframe) => ({
      src: iframe.getAttribute("src"),
      title: iframe.getAttribute("title"),
    }));

    return {
      canonicalUrl: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
      title: (document.querySelector("title")?.textContent || "").replace(/\s+/g, " ").trim(),
      h1: (document.querySelector("h1")?.textContent || "").replace(/\s+/g, " ").trim(),
      contentText: (clonedMain.textContent || "").replace(/\s+/g, " ").trim(),
      contentHtml: clonedMain.innerHTML || "",
      links,
      assets: [...imageAssets, ...iconAssets],
      iframeEmbeds,
      userAgent: navigator.userAgent,
      lang: document.documentElement.lang || null,
    };
  }, sourcePass);

  return {
    ...pageData,
    sessions: buildStructuredSessions(pageData.contentHtml, pageData.contentText, sourcePass),
  };
}

export async function extractFromPage(
  page: Page,
  url: string,
  allowedDomains: string[],
): Promise<ExtractedPagePayload> {
  const passA = await capturePageState(page, "visible_dom");
  const interactionLog = await runInteractivePass(page);
  const passB = await capturePageState(page, "interactive");

  const mergedSessions = mergeSessions(passA.sessions, passB.sessions);
  const mergedAssets = mergeAssets(passA.assets, passB.assets);

  const normalizedContentText = normalizeWhitespace(passB.contentText || passA.contentText || "");
  const filteredLinks = [...passA.links, ...passB.links]
    .map((item) => {
      try {
        const normalizedHref = normalizeUrl(item.href);
        return {
          href: normalizedHref,
          text: normalizeWhitespace(item.text),
          isInternal: isInternalUrl(normalizedHref, allowedDomains),
        };
      } catch {
        return null;
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const deduplicatedLinks = Array.from(
    new Map(filteredLinks.map((item) => [item.href, item])).values(),
  );

  return {
    url,
    urlNormalized: normalizeUrl(url),
    canonicalUrl: (passB.canonicalUrl || passA.canonicalUrl) ? normalizeUrl(passB.canonicalUrl || passA.canonicalUrl || "") : null,
    title: normalizeWhitespace(passB.title || passA.title) || null,
    h1: normalizeWhitespace(passB.h1 || passA.h1) || null,
    contentText: normalizedContentText,
    contentHtml: passB.contentHtml || passA.contentHtml || "",
    contentHash: computeContentHash(normalizedContentText),
    links: deduplicatedLinks,
    assets: mergedAssets,
    sessions: mergedSessions,
    metadata: {
      lang: passB.lang || passA.lang,
      userAgent: passB.userAgent || passA.userAgent,
      extractedAt: new Date().toISOString(),
      extractionMode: "two_pass",
      interactionClicks: interactionLog.length,
      iframeEmbeds: [...passA.iframeEmbeds, ...passB.iframeEmbeds],
    },
  };
}
