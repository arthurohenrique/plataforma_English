import { Container } from "./ui/Container";
import { site, whatsappUrl } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-background border-t border-hairline py-8 sm:py-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
      <Container className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="inline-block h-5 w-5 rounded-full bg-foreground" />
          <span className="text-[13px] font-semibold text-foreground">
            {site.name}
          </span>
        </div>

        <p className="text-[11px] sm:text-[12px] text-muted">
          © {new Date().getFullYear()} {site.name}. Todos os direitos reservados.
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] sm:text-[12px] text-muted hover:text-foreground transition-colors"
        >
          WhatsApp · {site.phoneDisplay}
        </a>
      </Container>
    </footer>
  );
}
