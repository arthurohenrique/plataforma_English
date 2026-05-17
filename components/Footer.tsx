import { Container } from "./ui/Container";
import { site, whatsappUrl } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-background border-t border-hairline py-10">
      <Container className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-block h-5 w-5 rounded-full bg-foreground" />
          <span className="text-[13px] font-semibold text-foreground">
            {site.name}
          </span>
        </div>

        <p className="text-[12px] text-muted">
          © {new Date().getFullYear()} {site.name}. Todos os direitos reservados.
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-muted hover:text-foreground transition-colors"
        >
          WhatsApp · {site.phoneDisplay}
        </a>
      </Container>
    </footer>
  );
}
