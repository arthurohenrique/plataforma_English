import type { Area } from "./types";

export const AREAS: Area[] = [
  {
    id: "vocabulario",
    title: "Vocabulário",
    description: "Palavras essenciais com exemplos em contexto real.",
    icon: "book",
    accent: "#C8102E",
  },
  {
    id: "pronuncia",
    title: "Pronúncia",
    description: "Sons, ritmo e entonação para soar natural.",
    icon: "wave",
    accent: "#0A2540",
  },
  {
    id: "audio-video",
    title: "Áudio & Vídeo",
    description: "Compreensão auditiva com material autêntico.",
    icon: "headphones",
    accent: "#D4A017",
  },
  {
    id: "gramatica",
    title: "Gramática",
    description: "Estruturas que destravam suas frases.",
    icon: "blocks",
    accent: "#1d4ed8",
  },
  {
    id: "leitura",
    title: "Leitura",
    description: "Textos curtos, vocabulário em uso.",
    icon: "document",
    accent: "#059669",
  },
];

export function findArea(id: string): Area | undefined {
  return AREAS.find((a) => a.id === id);
}
