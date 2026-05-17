import { Container } from "./ui/Container";
import { whatsappUrl } from "@/lib/site";

const nav = [
  { href: "#metodo", label: "Método" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#professor", label: "Professor" },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#faq", label: "Dúvidas" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 border-b border-hairline">
      <Container className="flex h-14 items-center justify-between gap-3">
        <a href="#top" className="flex items-center gap-2 min-w-0 shrink-0">
          <span className="inline-block h-6 w-6 rounded-full bg-foreground shrink-0" />
          <span className="text-[14px] sm:text-[15px] font-semibold tracking-tight text-foreground truncate">
            Oxford<span className="hidden xs:inline sm:inline"> Particular</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-5 lg:gap-7">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <a
            href="/plataforma"
            className="inline-flex h-9 items-center rounded-full border border-hairline bg-white px-3 sm:px-4 text-[12px] sm:text-[13px] font-medium text-foreground hover:bg-foreground/5 transition-colors"
          >
            Entrar
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center rounded-full bg-foreground px-3 sm:px-4 text-[12px] sm:text-[13px] font-medium text-white hover:bg-[#0f2f4f] transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline">Agendar aula</span>
            <span className="sm:hidden">Agendar</span>
          </a>
        </div>
      </Container>
    </header>
  );
}
