import { Container } from "./ui/Container";

const faqs = [
  {
    q: "Como funcionam as aulas?",
    a: "São 100% online, individuais, ao vivo com o professor. Você escolhe os horários e recebe um plano sob medida para o seu objetivo.",
  },
  {
    q: "Preciso já ter algum nível de inglês?",
    a: "Não. Atendemos do absoluto iniciante (A1) ao avançado (C1). A primeira aula serve para mapear seu nível e desenhar o plano.",
  },
  {
    q: "Qual a duração e a frequência ideal?",
    a: "Cada aula dura 50 minutos. Para evoluir de forma consistente, recomendamos 2 aulas por semana — mas adaptamos à sua rotina.",
  },
  {
    q: "A aula experimental tem custo?",
    a: "Não. A primeira aula é gratuita e sem compromisso. Você experimenta o método e decide se faz sentido continuar.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Não há fidelidade. Você assume o ritmo que faz sentido e pode pausar ou encerrar a qualquer momento.",
  },
  {
    q: "Quais materiais usamos?",
    a: "Materiais oficiais da Oxford University Press e recursos complementares selecionados conforme o seu objetivo.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-surface py-24 sm:py-32">
      <Container>
        <div className="max-w-2xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">
            Dúvidas frequentes
          </p>
          <h2 className="mt-4 text-[36px] sm:text-[52px] leading-[1.05] font-semibold tracking-[-0.03em] text-foreground">
            Tudo o que você
            <br />
            <span className="text-muted">precisa saber.</span>
          </h2>
        </div>

        <div className="mt-12 mx-auto max-w-3xl divide-y divide-hairline rounded-3xl border border-hairline bg-white">
          {faqs.map((f, i) => (
            <details
              key={f.q}
              className="group px-6 sm:px-8 py-5 [&_summary::-webkit-details-marker]:hidden"
              open={i === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                <span className="text-[17px] font-medium tracking-tight text-foreground">
                  {f.q}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hairline text-muted transition-transform group-open:rotate-45">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
