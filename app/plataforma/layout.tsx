import type { ReactNode } from "react";
import "@/plataforma/styles.css";
import { PlatformProvider } from "@/plataforma";

export const metadata = {
  title: "Plataforma · Oxford Particular",
  description:
    "Plataforma de estudos com áreas, desafios e aulas gravadas em cronologia.",
};

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div data-platform>
      <PlatformProvider>{children}</PlatformProvider>
    </div>
  );
}
