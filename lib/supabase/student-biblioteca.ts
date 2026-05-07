import curriculumMapJson from "@/lib/config/curriculum/oup-intermediate3.json";
import { createClient } from "@supabase/supabase-js";

const CONTEUDO_ID = "english-file-intermediate3";

type CurriculumItem = {
  id: string;
  title: string;
  order: number;
  pathPattern: string;
};

type CurriculumUnit = {
  id: string;
  title: string;
  order: number;
  items: CurriculumItem[];
};

type CurriculumSection = {
  id: string;
  title: string;
  order: number;
  units: CurriculumUnit[];
};

type CurriculumConfig = {
  basePath: string;
  sections: CurriculumSection[];
};

type CurriculumMatch = {
  sectionId: string;
  sectionTitle: string;
  sectionOrder: number;
  unitId: string;
  unitTitle: string;
  unitOrder: number;
  itemId: string;
  itemTitle: string;
  itemOrder: number;
  mapped: boolean;
  relativePath: string;
};

const curriculumConfig = curriculumMapJson as CurriculumConfig;

function createServiceRoleSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Variaveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorias.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type BibliotecaDidacticOption = {
  id: string;
  label: string | null;
  text: string | null;
  isCorrect: boolean;
};

export type BibliotecaDidacticQuestion = {
  id: string;
  questionType: string;
  promptText: string | null;
  promptHtml: string | null;
  options: BibliotecaDidacticOption[];
  answerKeys: string[];
};

export type BibliotecaDidacticExercise = {
  id: string;
  title: string | null;
  instruction: string | null;
  exerciseType: string;
  questions: BibliotecaDidacticQuestion[];
};

export type BibliotecaDidacticSession = {
  id: string;
  title: string | null;
  description: string | null;
  sessionType: string;
  exercises: BibliotecaDidacticExercise[];
};

export type BibliotecaLesson = {
  id: string;
  moduloId: string;
  titulo: string;
  descricao: string;
  contentText: string;
  contentHtml: string;
  sourceUrl: string;
  ordem: number;
  didacticSessions: BibliotecaDidacticSession[];
  sectionId: string;
  sectionTitle: string;
  unitId: string;
  unitTitle: string;
  itemId: string;
  itemTitle: string;
  itemOrder: number;
  mapped: boolean;
};

export type BibliotecaUnit = {
  id: string;
  titulo: string;
  ordem: number;
  aulas: BibliotecaLesson[];
};

export type BibliotecaSection = {
  id: string;
  titulo: string;
  ordem: number;
  units: BibliotecaUnit[];
};

export type BibliotecaModule = {
  id: string;
  titulo: string;
  ordem: number;
  aulas: BibliotecaLesson[];
};

export type BibliotecaConteudo = {
  id: string;
  titulo: string;
  descricao: string;
};

export type BibliotecaPayload = {
  conteudo: BibliotecaConteudo;
  sections: BibliotecaSection[];
  modulos: BibliotecaModule[];
  aulas: BibliotecaLesson[];
  mapCoverage: {
    mappedPages: number;
    unmappedPages: number;
    mappedPercent: number;
  };
};

type ScrapedPageRow = {
  id: string;
  url: string;
  title: string | null;
  content_text: string | null;
  content_html: string | null;
};

type SessionRow = {
  id: string;
  page_id: string;
  titulo: string | null;
  descricao: string | null;
  session_type: string;
  ordem: number;
};

type ExerciseRow = {
  id: string;
  session_id: string;
  titulo: string | null;
  instrucao: string | null;
  exercise_type: string;
  ordem: number;
};

type QuestionRow = {
  id: string;
  exercise_id: string;
  question_type: string;
  enunciado_texto: string | null;
  enunciado_html: string | null;
  ordem: number;
};

type OptionRow = {
  id: string;
  question_id: string;
  rotulo: string | null;
  option_texto: string | null;
  ordem: number;
};

type CorrectOptionRow = {
  question_id: string;
  option_id: string;
};

type AnswerKeyRow = {
  question_id: string;
  value_text: string | null;
  value_texts: string[] | null;
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function buildTitleFromUrl(urlValue: string): string {
  const parsed = new URL(urlValue);
  const parts = parsed.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "pagina";
  return decodeURIComponent(last).replace(/[-_]/g, " ");
}

function buildDescription(contentText: string): string {
  const cleaned = normalizeWhitespace(contentText);
  if (!cleaned) return "Conteudo sem descricao.";
  return cleaned.length > 180 ? `${cleaned.slice(0, 180)}...` : cleaned;
}

function getRelativePath(urlValue: string): string {
  const parsed = new URL(urlValue);
  const normalizedBase = curriculumConfig.basePath.endsWith("/")
    ? curriculumConfig.basePath.slice(0, -1)
    : curriculumConfig.basePath;

  if (parsed.pathname === normalizedBase || parsed.pathname === `${normalizedBase}/`) {
    return "/";
  }

  if (parsed.pathname.startsWith(`${normalizedBase}/`)) {
    return parsed.pathname.slice(normalizedBase.length);
  }

  return parsed.pathname;
}

function resolveCurriculumMatch(urlValue: string): CurriculumMatch {
  const relativePath = getRelativePath(urlValue);
  for (const section of curriculumConfig.sections.sort((a, b) => a.order - b.order)) {
    for (const unit of section.units.sort((a, b) => a.order - b.order)) {
      for (const item of unit.items.sort((a, b) => a.order - b.order)) {
        const regex = new RegExp(item.pathPattern, "i");
        if (regex.test(relativePath)) {
          return {
            sectionId: section.id,
            sectionTitle: section.title,
            sectionOrder: section.order,
            unitId: unit.id,
            unitTitle: unit.title,
            unitOrder: unit.order,
            itemId: item.id,
            itemTitle: item.title,
            itemOrder: item.order,
            mapped: true,
            relativePath,
          };
        }
      }
    }
  }

  return {
    sectionId: "outros",
    sectionTitle: "Outros",
    sectionOrder: 999,
    unitId: "outros-nao-mapeados",
    unitTitle: "Nao mapeados",
    unitOrder: 999,
    itemId: `outros-${relativePath}`,
    itemTitle: buildTitleFromUrl(urlValue),
    itemOrder: 999,
    mapped: false,
    relativePath,
  };
}

function buildDidacticTree(
  pageId: string,
  sessions: SessionRow[],
  exercises: ExerciseRow[],
  questions: QuestionRow[],
  options: OptionRow[],
  correctOptions: CorrectOptionRow[],
  answerKeys: AnswerKeyRow[],
): BibliotecaDidacticSession[] {
  const correctOptionIdsByQuestion = new Map<string, Set<string>>();
  for (const row of correctOptions) {
    const set = correctOptionIdsByQuestion.get(row.question_id) ?? new Set<string>();
    set.add(row.option_id);
    correctOptionIdsByQuestion.set(row.question_id, set);
  }

  const answerKeysByQuestion = new Map<string, string[]>();
  for (const row of answerKeys) {
    const values = (row.value_texts ?? []).filter(Boolean);
    if (row.value_text) values.unshift(row.value_text);
    answerKeysByQuestion.set(row.question_id, Array.from(new Set(values)));
  }

  const sessionsByPage = sessions
    .filter((session) => session.page_id === pageId)
    .sort((a, b) => a.ordem - b.ordem);

  return sessionsByPage.map((session) => {
    const exercisesBySession = exercises
      .filter((exercise) => exercise.session_id === session.id)
      .sort((a, b) => a.ordem - b.ordem);

    return {
      id: session.id,
      title: session.titulo,
      description: session.descricao,
      sessionType: session.session_type,
      exercises: exercisesBySession.map((exercise) => {
        const questionsByExercise = questions
          .filter((question) => question.exercise_id === exercise.id)
          .sort((a, b) => a.ordem - b.ordem);

        return {
          id: exercise.id,
          title: exercise.titulo,
          instruction: exercise.instrucao,
          exerciseType: exercise.exercise_type,
          questions: questionsByExercise.map((question) => {
            const optionsByQuestion = options
              .filter((option) => option.question_id === question.id)
              .sort((a, b) => a.ordem - b.ordem);
            const correctOptionSet = correctOptionIdsByQuestion.get(question.id) ?? new Set<string>();

            return {
              id: question.id,
              questionType: question.question_type,
              promptText: question.enunciado_texto,
              promptHtml: question.enunciado_html,
              options: optionsByQuestion.map((option) => ({
                id: option.id,
                label: option.rotulo,
                text: option.option_texto,
                isCorrect: correctOptionSet.has(option.id),
              })),
              answerKeys: answerKeysByQuestion.get(question.id) ?? [],
            };
          }),
        };
      }),
    };
  });
}

function buildPayload(
  rows: ScrapedPageRow[],
  sessions: SessionRow[],
  exercises: ExerciseRow[],
  questions: QuestionRow[],
  options: OptionRow[],
  correctOptions: CorrectOptionRow[],
  answerKeys: AnswerKeyRow[],
): BibliotecaPayload {
  const mappedRows = rows.map((row) => ({
    row,
    match: resolveCurriculumMatch(row.url),
  }));

  mappedRows.sort((a, b) => {
    if (a.match.sectionOrder !== b.match.sectionOrder) return a.match.sectionOrder - b.match.sectionOrder;
    if (a.match.unitOrder !== b.match.unitOrder) return a.match.unitOrder - b.match.unitOrder;
    if (a.match.itemOrder !== b.match.itemOrder) return a.match.itemOrder - b.match.itemOrder;
    return a.match.relativePath.localeCompare(b.match.relativePath);
  });

  const sectionsMap = new Map<string, { id: string; titulo: string; ordem: number; units: Map<string, BibliotecaUnit> }>();
  const lessons: BibliotecaLesson[] = [];

  mappedRows.forEach(({ row, match }, index) => {
    if (!sectionsMap.has(match.sectionId)) {
      sectionsMap.set(match.sectionId, {
        id: match.sectionId,
        titulo: match.sectionTitle,
        ordem: match.sectionOrder,
        units: new Map<string, BibliotecaUnit>(),
      });
    }

    const section = sectionsMap.get(match.sectionId)!;
    if (!section.units.has(match.unitId)) {
      section.units.set(match.unitId, {
        id: match.unitId,
        titulo: match.unitTitle,
        ordem: match.unitOrder,
        aulas: [],
      });
    }

    const unit = section.units.get(match.unitId)!;
    const lesson: BibliotecaLesson = {
      id: row.id,
      moduloId: `${match.sectionId}:${match.unitId}`,
      titulo: row.title?.trim() || match.itemTitle || buildTitleFromUrl(row.url),
      descricao: buildDescription(row.content_text ?? ""),
      contentText: row.content_text ?? "",
      contentHtml: row.content_html ?? "",
      sourceUrl: row.url,
      ordem: index + 1,
      didacticSessions: buildDidacticTree(
        row.id,
        sessions,
        exercises,
        questions,
        options,
        correctOptions,
        answerKeys,
      ),
      sectionId: match.sectionId,
      sectionTitle: match.sectionTitle,
      unitId: match.unitId,
      unitTitle: match.unitTitle,
      itemId: match.itemId,
      itemTitle: match.itemTitle,
      itemOrder: match.itemOrder,
      mapped: match.mapped,
    };

    unit.aulas.push(lesson);
    lessons.push(lesson);
  });

  const sections: BibliotecaSection[] = Array.from(sectionsMap.values())
    .sort((a, b) => a.ordem - b.ordem)
    .map((section) => ({
      id: section.id,
      titulo: section.titulo,
      ordem: section.ordem,
      units: Array.from(section.units.values())
        .sort((a, b) => a.ordem - b.ordem)
        .map((unit) => ({
          ...unit,
          aulas: unit.aulas.sort((a, b) => a.itemOrder - b.itemOrder || a.titulo.localeCompare(b.titulo)),
        })),
    }));

  const modulos: BibliotecaModule[] = sections.flatMap((section) =>
    section.units.map((unit, idx) => ({
      id: `${section.id}:${unit.id}`,
      titulo: `${section.titulo} - ${unit.titulo}`,
      ordem: section.ordem * 100 + idx + 1,
      aulas: unit.aulas,
    })),
  );

  const mappedPages = lessons.filter((lesson) => lesson.mapped).length;
  const unmappedPages = lessons.length - mappedPages;
  const mappedPercent = lessons.length ? Number(((mappedPages / lessons.length) * 100).toFixed(2)) : 0;

  return {
    conteudo: {
      id: CONTEUDO_ID,
      titulo: "English File Intermediate (OUP)",
      descricao: "Conteudo importado com organizacao curricular didatica para a area do aluno.",
    },
    sections,
    modulos,
    aulas: lessons,
    mapCoverage: {
      mappedPages,
      unmappedPages,
      mappedPercent,
    },
  };
}

export async function getStudentBiblioteca(): Promise<BibliotecaPayload> {
  const supabase = createServiceRoleSupabaseClient();

  const { data: pages, error: pagesError } = await supabase
    .from("scraped_pages")
    .select("id,url,title,content_text,content_html")
    .eq("status", "success")
    .eq("is_published", true)
    .like("url", "https://elt.oup.com/student/englishfile/intermediate3%")
    .order("url", { ascending: true });

  if (pagesError) {
    throw new Error(`Falha ao carregar biblioteca do aluno: ${pagesError.message}`);
  }

  const pageIds = (pages ?? []).map((page) => page.id);
  if (!pageIds.length) {
    return buildPayload([], [], [], [], [], [], []);
  }

  const [{ data: sessionsData, error: sessionsError }, { data: exercisesData, error: exercisesError }] =
    await Promise.all([
      supabase
        .from("scraped_sessions")
        .select("id,page_id,titulo,descricao,session_type,ordem")
        .in("page_id", pageIds)
        .order("ordem", { ascending: true }),
      supabase
        .from("scraped_exercises")
        .select("id,session_id,titulo,instrucao,exercise_type,ordem")
        .order("ordem", { ascending: true }),
    ]);

  if (sessionsError) {
    throw new Error(`Falha ao carregar sessoes didaticas: ${sessionsError.message}`);
  }
  if (exercisesError) {
    throw new Error(`Falha ao carregar exercicios didaticos: ${exercisesError.message}`);
  }

  const sessionIds = (sessionsData ?? []).map((session) => session.id);
  const exerciseIds = (exercisesData ?? [])
    .filter((exercise) => sessionIds.includes(exercise.session_id))
    .map((exercise) => exercise.id);

  const { data: questionsData, error: questionsError } = await supabase
    .from("scraped_questions")
    .select("id,exercise_id,question_type,enunciado_texto,enunciado_html,ordem")
    .in("exercise_id", exerciseIds.length ? exerciseIds : ["00000000-0000-0000-0000-000000000000"])
    .order("ordem", { ascending: true });

  if (questionsError) {
    throw new Error(`Falha ao carregar questoes didaticas: ${questionsError.message}`);
  }

  const questionIds = (questionsData ?? []).map((question) => question.id);

  const [
    { data: optionsData, error: optionsError },
    { data: correctData, error: correctError },
    { data: answerKeysData, error: answerKeysError },
  ] = await Promise.all([
    supabase
      .from("scraped_question_options")
      .select("id,question_id,rotulo,option_texto,ordem")
      .in("question_id", questionIds.length ? questionIds : ["00000000-0000-0000-0000-000000000000"])
      .order("ordem", { ascending: true }),
    supabase
      .from("scraped_question_correct_options")
      .select("question_id,option_id")
      .in("question_id", questionIds.length ? questionIds : ["00000000-0000-0000-0000-000000000000"]),
    supabase
      .from("scraped_question_answer_keys")
      .select("question_id,value_text,value_texts")
      .in("question_id", questionIds.length ? questionIds : ["00000000-0000-0000-0000-000000000000"]),
  ]);

  if (optionsError) {
    throw new Error(`Falha ao carregar opcoes didaticas: ${optionsError.message}`);
  }
  if (correctError) {
    throw new Error(`Falha ao carregar opcoes corretas: ${correctError.message}`);
  }
  if (answerKeysError) {
    throw new Error(`Falha ao carregar gabaritos didaticos: ${answerKeysError.message}`);
  }

  return buildPayload(
    (pages ?? []) as ScrapedPageRow[],
    (sessionsData ?? []) as SessionRow[],
    ((exercisesData ?? []).filter((exercise) => sessionIds.includes(exercise.session_id)) as ExerciseRow[]),
    (questionsData ?? []) as QuestionRow[],
    (optionsData ?? []) as OptionRow[],
    (correctData ?? []) as CorrectOptionRow[],
    (answerKeysData ?? []) as AnswerKeyRow[],
  );
}

export async function getStudentBibliotecaLesson(
  conteudoId: string,
  aulaId: string,
): Promise<(BibliotecaPayload & { aulaAtual: BibliotecaLesson; anterior?: BibliotecaLesson; proxima?: BibliotecaLesson }) | null> {
  if (conteudoId !== CONTEUDO_ID) {
    return null;
  }

  const payload = await getStudentBiblioteca();
  const currentIndex = payload.aulas.findIndex((aula) => aula.id === aulaId);

  if (currentIndex < 0) {
    return null;
  }

  return {
    ...payload,
    aulaAtual: payload.aulas[currentIndex],
    anterior: currentIndex > 0 ? payload.aulas[currentIndex - 1] : undefined,
    proxima: currentIndex < payload.aulas.length - 1 ? payload.aulas[currentIndex + 1] : undefined,
  };
}
