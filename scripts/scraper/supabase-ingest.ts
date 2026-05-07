import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  ExtractedAsset,
  ExtractedPagePayload,
  ExtractedSession,
  ScrapeCounters,
  ScrapeStatus,
} from "./types";

interface PersistPageInput {
  runId: number;
  page: ExtractedPagePayload;
  status: ScrapeStatus;
  httpStatus: number | null;
  errorMessage?: string;
}

interface PersistPageResult {
  pageId: string | null;
  isUnchangedVersion: boolean;
}

function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Variaveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorias.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export class ScrapeRepository {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient = getServiceClient()) {
    this.client = client;
  }

  async createRun(sourceName: string, seedCount: number): Promise<number> {
    const { data, error } = await this.client
      .from("scrape_runs")
      .insert({
        source_name: sourceName,
        seed_count: seedCount,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(`Falha ao criar scrape_run: ${error?.message ?? "desconhecido"}`);
    }

    return data.id as number;
  }

  async finishRun(runId: number, counters: ScrapeCounters): Promise<void> {
    const { error } = await this.client
      .from("scrape_runs")
      .update({
        finished_at: new Date().toISOString(),
        ok_count: counters.okCount,
        blocked_count: counters.blockedCount,
        error_count: counters.errorCount,
        changed_count: counters.changedCount,
        unchanged_count: counters.unchangedCount,
        ignored_count: counters.ignoredCount,
      })
      .eq("id", runId);

    if (error) {
      throw new Error(`Falha ao finalizar scrape_run ${runId}: ${error.message}`);
    }
  }

  async persistPage(input: PersistPageInput): Promise<PersistPageResult> {
    if (input.status !== "success") {
      const { data, error } = await this.client
        .from("scraped_pages")
        .insert({
          run_id: input.runId,
          url: input.page.url,
          url_normalized: input.page.urlNormalized,
          canonical_url: input.page.canonicalUrl,
          title: input.page.title,
          h1: input.page.h1,
          status: input.status,
          error_message: input.errorMessage ?? null,
          http_status: input.httpStatus,
          metadata: input.page.metadata,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(`Falha ao salvar pagina (${input.page.url}): ${error.message}`);
      }

      return { pageId: data?.id ?? null, isUnchangedVersion: false };
    }

    const { data: existing } = await this.client
      .from("scraped_pages")
      .select("id")
      .eq("url_normalized", input.page.urlNormalized)
      .eq("status", "success")
      .eq("content_hash", input.page.contentHash)
      .maybeSingle();

    if (existing?.id) {
      const { data: updated, error: updateError } = await this.client
        .from("scraped_pages")
        .update({
          run_id: input.runId,
          http_status: input.httpStatus,
          metadata: input.page.metadata,
          last_seen_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("id")
        .single();

      if (updateError || !updated) {
        throw new Error(
          `Falha ao atualizar pagina existente (${input.page.url}): ${updateError?.message ?? "desconhecido"}`,
        );
      }

      await this.syncLearningStructure(updated.id, input.page.sessions);
      await this.syncAssets(updated.id, input.page.assets);
      return { pageId: updated.id, isUnchangedVersion: true };
    }

    const { data, error } = await this.client
      .from("scraped_pages")
      .insert({
        run_id: input.runId,
        url: input.page.url,
        url_normalized: input.page.urlNormalized,
        canonical_url: input.page.canonicalUrl,
        title: input.page.title,
        h1: input.page.h1,
        content_text: input.page.contentText,
        content_html: input.page.contentHtml,
        content_hash: input.page.contentHash,
        status: "success",
        error_message: null,
        http_status: input.httpStatus,
        metadata: input.page.metadata,
        last_seen_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(`Falha ao inserir pagina (${input.page.url}): ${error?.message ?? "desconhecido"}`);
    }

    await this.syncLearningStructure(data.id, input.page.sessions);
    await this.syncAssets(data.id, input.page.assets);
    return { pageId: data.id, isUnchangedVersion: false };
  }

  private async syncLearningStructure(pageId: string, sessions: ExtractedSession[]): Promise<void> {
    const { error: deleteError } = await this.client.from("scraped_sessions").delete().eq("page_id", pageId);

    if (deleteError) {
      throw new Error(`Falha ao limpar estrutura didatica da pagina ${pageId}: ${deleteError.message}`);
    }

    if (!sessions.length) {
      return;
    }

    for (const [sessionIndex, session] of sessions.entries()) {
      const { data: sessionRow, error: sessionError } = await this.client
        .from("scraped_sessions")
        .insert({
          page_id: pageId,
          external_key: session.externalKey,
          titulo: session.title,
          descricao: session.description,
          session_type: session.sessionType,
          ordem: sessionIndex + 1,
          source_pass: session.sourcePass,
          metadata: session.metadata,
        })
        .select("id")
        .single();

      if (sessionError || !sessionRow) {
        throw new Error(`Falha ao inserir sessao da pagina ${pageId}: ${sessionError?.message ?? "desconhecido"}`);
      }

      for (const [exerciseIndex, exercise] of session.exercises.entries()) {
        const { data: exerciseRow, error: exerciseError } = await this.client
          .from("scraped_exercises")
          .insert({
            session_id: sessionRow.id,
            external_key: exercise.externalKey,
            titulo: exercise.title,
            instrucao: exercise.instruction,
            exercise_type: exercise.exerciseType,
            ordem: exerciseIndex + 1,
            metadata: exercise.metadata,
          })
          .select("id")
          .single();

        if (exerciseError || !exerciseRow) {
          throw new Error(
            `Falha ao inserir exercicio da sessao ${sessionRow.id}: ${exerciseError?.message ?? "desconhecido"}`,
          );
        }

        for (const [questionIndex, question] of exercise.questions.entries()) {
          const { data: questionRow, error: questionError } = await this.client
            .from("scraped_questions")
            .insert({
              exercise_id: exerciseRow.id,
              external_key: question.externalKey,
              question_type: question.questionType,
              enunciado_texto: question.promptText,
              enunciado_html: question.promptHtml,
              pontos: question.points,
              ordem: questionIndex + 1,
              metadata: question.metadata,
            })
            .select("id")
            .single();

          if (questionError || !questionRow) {
            throw new Error(
              `Falha ao inserir questao do exercicio ${exerciseRow.id}: ${questionError?.message ?? "desconhecido"}`,
            );
          }

          const optionRows: Array<{ id: string; isCorrect: boolean }> = [];
          for (const [optionIndex, option] of question.options.entries()) {
            const { data: optionRow, error: optionError } = await this.client
              .from("scraped_question_options")
              .insert({
                question_id: questionRow.id,
                external_key: option.externalKey,
                rotulo: option.rotulo,
                option_texto: option.optionText,
                option_html: option.optionHtml,
                ordem: optionIndex + 1,
                metadata: option.metadata,
              })
              .select("id")
              .single();

            if (optionError || !optionRow) {
              throw new Error(
                `Falha ao inserir opcao da questao ${questionRow.id}: ${optionError?.message ?? "desconhecido"}`,
              );
            }

            optionRows.push({ id: optionRow.id, isCorrect: option.isCorrect });
          }

          const correctOptionRows = optionRows
            .filter((row) => row.isCorrect)
            .map((row) => ({ question_id: questionRow.id, option_id: row.id }));

          if (correctOptionRows.length > 0) {
            const { error: correctError } = await this.client
              .from("scraped_question_correct_options")
              .insert(correctOptionRows);

            if (correctError) {
              throw new Error(
                `Falha ao inserir opcoes corretas da questao ${questionRow.id}: ${correctError.message}`,
              );
            }
          }

          if (question.answerKeys.length > 0) {
            const { error: answerKeyError } = await this.client.from("scraped_question_answer_keys").insert({
              question_id: questionRow.id,
              answer_type: "text",
              value_text: question.answerKeys[0],
              value_texts: question.answerKeys,
              metadata: { source: "scraper" },
            });

            if (answerKeyError) {
              throw new Error(
                `Falha ao inserir gabarito da questao ${questionRow.id}: ${answerKeyError.message}`,
              );
            }
          }
        }
      }
    }
  }

  private async syncAssets(pageId: string, assets: ExtractedAsset[]): Promise<void> {
    const { error: deleteError } = await this.client.from("scraped_assets").delete().eq("page_id", pageId);
    if (deleteError) {
      throw new Error(`Falha ao limpar assets da pagina ${pageId}: ${deleteError.message}`);
    }

    if (!assets.length) {
      return;
    }

    const rows = assets.map((asset, index) => ({
      page_id: pageId,
      asset_url: asset.assetUrl,
      asset_type: asset.assetType,
      alt_text: asset.altText,
      title: asset.title,
      mime_type: asset.mimeType,
      width: asset.width,
      height: asset.height,
      ordem: index + 1,
      source_pass: asset.sourcePass,
      metadata: asset.metadata,
    }));

    const { error: insertError } = await this.client.from("scraped_assets").insert(rows);
    if (insertError) {
      throw new Error(`Falha ao inserir assets da pagina ${pageId}: ${insertError.message}`);
    }
  }
}
