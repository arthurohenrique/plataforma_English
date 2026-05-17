import { Container } from "./ui/Container";

const credentials = [
  "Formação em Letras / Inglês",
  "Experiência em curso online",
  "Alunos em empresas multinacionais",
];

export function Teacher() {
  return (
    <section id="professor" className="bg-surface py-16 sm:py-24 lg:py-32">
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
              Mais de uma década ensinando profissionais a destravar o
              inglês. Aulas práticas, com correções no momento certo e um
              plano feito para o seu objetivo — viagem, trabalho ou estudo.
            </p>

            <ul className="mt-6 sm:mt-8 space-y-3">
              {credentials.map((c) => (
                <li key={c} className="flex items-center gap-3 text-[15px] sm:text-[16px] text-foreground">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                      aria-hidden
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual card */}
          <div className="lg:col-span-6">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-accent/15 via-gold/10 to-blue-deep/15 blur-2xl" />
              <div className="relative rounded-2xl sm:rounded-[28px] border border-hairline bg-white p-6 sm:p-8 lg:p-10 shadow-[0_30px_60px_-30px_rgba(10,37,64,0.25)]">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-blue-deep to-accent shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[15px] sm:text-[16px] font-semibold text-foreground truncate">
                      Professor particular
                    </p>
                    <p className="text-[12px] sm:text-[13px] text-muted truncate">
                      Formação em Letras · Método Oxford
                    </p>
                  </div>
                </div>

                <blockquote className="mt-6 sm:mt-8 text-[17px] sm:text-[20px] leading-relaxed font-medium tracking-tight text-foreground">
                  “Meu trabalho é fazer você confiar no próprio inglês — não
                  decorar regras, mas usar a língua com naturalidade.”
                </blockquote>

                <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-3 sm:gap-4 border-t border-hairline pt-5 sm:pt-6">
                  <Mini value="+10" label="anos" />
                  <Mini value="200+" label="alunos" />
                  <Mini value="A1–C1" label="níveis" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Mini({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-[18px] sm:text-[22px] font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="text-[11px] sm:text-[12px] text-muted">{label}</p>
    </div>
  );
}
