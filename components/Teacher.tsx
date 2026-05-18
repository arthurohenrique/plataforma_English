import Image from "next/image";
import { Container } from "./ui/Container";

export function Teacher() {
  return (
    <section
      id="professor"
      className="bg-surface py-16 sm:py-24 lg:py-32 overflow-hidden"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Text */}
          <div className="lg:col-span-6">
            <p className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">
              Sobre o professor
            </p>
            <h2 className="mt-4 text-[clamp(1.875rem,5.5vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-foreground">
              Quer falar inglês
              <br />
              <span className="text-muted">de verdade?</span>
            </h2>
            <p className="mt-4 sm:mt-5 text-[16px] sm:text-[18px] leading-relaxed text-muted">
              Aulas particulares com foco em conversação real. Correções no
              momento certo e um plano feito para o seu objetivo — viagem,
              trabalho ou estudo.
            </p>
          </div>

          {/* Visual card */}
          <div className="lg:col-span-6">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-accent/15 via-gold/10 to-blue-deep/15 blur-2xl" />
              <div className="relative rounded-2xl sm:rounded-[28px] border border-hairline bg-white p-6 sm:p-8 lg:p-10 shadow-[0_30px_60px_-30px_rgba(10,37,64,0.25)]">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-full border border-hairline bg-surface">
                    <Image
                      src="/reinaldo.jpeg"
                      alt="Reinaldo Montes"
                      fill
                      sizes="80px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[18px] sm:text-[22px] font-semibold tracking-tight text-foreground truncate">
                      Reinaldo Montes
                    </p>
                    <p className="text-[12px] sm:text-[13px] text-muted">
                      Aulas particulares de inglês
                    </p>
                  </div>
                </div>

                <blockquote className="mt-6 sm:mt-8 text-[17px] sm:text-[20px] leading-relaxed font-medium tracking-tight text-foreground">
                  “Meu trabalho é fazer você confiar no próprio inglês — não
                  decorar regras, mas usar a língua com naturalidade.”
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
