import { Container } from "./ui/Container";
import { whatsappUrl, site } from "@/lib/site";

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
      <Container className="flex h-14 items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded-full bg-foreground" />
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            {site.name}
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
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

        <div className="flex items-center gap-2">
          <a
            href="/plataforma"
            className="hidden sm:inline-flex h-9 items-center rounded-full border border-hairline bg-white px-4 text-[13px] font-medium text-foreground hover:bg-foreground/5 transition-colors"
          >
            Entrar
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-[13px] font-medium text-white hover:bg-[#0f2f4f] transition-colors"
          >
            Agendar aula
          </a>
        </div>
      </Container>
    </header>
  );
}
