import { Container } from "./ui/Container";
import { Button } from "./ui/Button";
import { whatsappUrl, site } from "@/lib/site";

export function FinalCTA() {
  return (
    <section id="agendar" className="bg-background py-24 sm:py-32">
      <Container>
        <div className="relative overflow-hidden rounded-[36px] bg-radial-deep px-8 py-16 sm:px-16 sm:py-24 text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-gold">
            Comece agora
          </p>
          <h2 className="mt-4 text-[40px] sm:text-[64px] leading-[1.02] font-semibold tracking-[-0.035em] text-white">
            Agende sua aula
            <br />
            <span className="text-white/60">experimental.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-white/70">
            Sem custo, sem compromisso. Em 50 minutos você sente o método —
            e descobre o quanto pode evoluir.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
            >
              <WhatsAppIcon />
              {site.phoneDisplay}
            </Button>
            <Button
              href="#metodo"
              variant="ghost"
              className="bg-white/5 text-white border-white/15 hover:bg-white/10"
            >
              Ver método novamente
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M20.52 3.48A11.86 11.86 0 0012.04 0C5.46 0 .12 5.34.12 11.92c0 2.1.55 4.15 1.6 5.95L0 24l6.32-1.66a11.9 11.9 0 005.72 1.46h.01c6.58 0 11.92-5.34 11.92-11.92 0-3.18-1.24-6.17-3.45-8.4zM12.05 21.8h-.01a9.88 9.88 0 01-5.04-1.38l-.36-.21-3.75.99 1-3.66-.23-.38a9.84 9.84 0 01-1.52-5.24c0-5.47 4.45-9.92 9.92-9.92 2.65 0 5.14 1.03 7.02 2.91a9.85 9.85 0 012.9 7.02c-.01 5.47-4.46 9.87-9.93 9.87zm5.45-7.4c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01s-.52.07-.79.37c-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.62.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z" />
    </svg>
  );
}
