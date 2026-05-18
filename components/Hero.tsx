import { Container } from "./ui/Container";
import { Button } from "./ui/Button";
import { whatsappUrl } from "@/lib/site";

export function Hero() {
  return (
    <section
      id="top"
      className="bg-radial-soft pt-16 sm:pt-24 lg:pt-28 pb-16 sm:pb-24 lg:pb-28 overflow-hidden"
    >
      <Container className="text-center">
        <div className="fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3 py-1 text-[11px] sm:text-[12px] font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="truncate">Aulas particulares de inglês · 100% online</span>
          </span>

          <h1 className="mt-6 sm:mt-7 text-[clamp(2.25rem,9vw,5rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-foreground">
            Aprenda inglês
            <br />
            <span className="bg-gradient-to-r from-accent via-[#e23652] to-gold bg-clip-text text-transparent">
              de verdade.
            </span>
          </h1>

          <p className="mx-auto mt-5 sm:mt-6 max-w-2xl text-[16px] sm:text-[19px] lg:text-[21px] leading-relaxed text-muted">
            Conversação real, horários flexíveis e um plano feito sob medida
            para o seu objetivo — resultados que você sente em semanas.
          </p>

          <div className="mt-8 sm:mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Button
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              className="w-full sm:w-auto"
            >
              Agende sua aula experimental
            </Button>
            <Button href="/plataforma" variant="ghost" className="w-full sm:w-auto">
              Entrar na plataforma
              <span aria-hidden>›</span>
            </Button>
          </div>

          <p className="mt-5 sm:mt-6 text-[12px] sm:text-[13px] text-muted leading-relaxed px-2">
            Sem mensalidade longa · Cancele quando quiser · Primeira aula sem compromisso
          </p>
        </div>

        {/* Hero visual: layered glass cards */}
        <div className="relative mx-auto mt-12 sm:mt-16 max-w-4xl">
          <div className="absolute -inset-x-6 sm:-inset-x-10 -top-6 h-40 rounded-[40px] bg-gradient-to-r from-accent/10 via-blue-deep/10 to-gold/10 blur-2xl" />
          <div className="relative rounded-[24px] sm:rounded-[28px] border border-hairline bg-white/80 backdrop-blur-xl shadow-[0_30px_60px_-20px_rgba(10,37,64,0.25)] p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-left">
              <Stat value="A1 → C1" label="Trilha completa" />
              <Stat value="1:1" label="Aulas individuais" />
              <Stat value="100%" label="Online, ao vivo" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[clamp(1.25rem,5vw,2.125rem)] font-semibold tracking-tight text-foreground">
        {value}
      </span>
      <span className="mt-1 text-[12px] sm:text-[14px] text-muted leading-snug">
        {label}
      </span>
    </div>
  );
}
