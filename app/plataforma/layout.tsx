import type { ReactNode } from "react";
import "@/plataforma/styles.css";
import { PlatformProvider } from "@/plataforma";

export const metadata = {
  title: "Plataforma · Reinaldo Montes",
  description:
    "Plataforma de estudos: materiais para download, aulas gravadas e flashcards com repetição espaçada.",
};

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div data-platform>
      <PlatformProvider>{children}</PlatformProvider>
    </div>
  );
}
