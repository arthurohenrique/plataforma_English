import { Container } from "./ui/Container";

const items = [
  {
    title: "Horários flexíveis",
    desc: "Encaixe nas suas manhãs, noites e fins de semana.",
  },
  {
    title: "Foco em conversação",
    desc: "Você fala 70% da aula — desde o primeiro dia.",
  },
  {
    title: "Aulas individuais",
    desc: "Plano sob medida para o seu objetivo, sem turma.",
  },
  {
    title: "Para viagens",
    desc: "Vocabulário e segurança para se virar em qualquer país.",
  },
  {
    title: "Para o trabalho",
    desc: "Inglês corporativo, reuniões e apresentações reais.",
  },
  {
    title: "Para entrevistas",
    desc: "Treino com perguntas comuns em multinacionais.",
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="bg-background py-16 sm:py-24 lg:py-32">
      <Container>
        <div className="max-w-2xl">
          <p className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">
            Benefícios
          </p>
          <h2 className="mt-4 text-[clamp(1.875rem,5.5vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-foreground">
            Inglês que cabe
            <br />
            <span className="text-muted">na sua vida.</span>
          </h2>
        </div>

        <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline rounded-2xl sm:rounded-3xl overflow-hidden border border-hairline">
          {items.map((item) => (
            <div
              key={item.title}
              className="bg-white p-6 sm:p-7 lg:p-9 transition-colors hover:bg-surface-2"
            >
              <CheckIcon />
              <h3 className="mt-4 sm:mt-5 text-[17px] sm:text-[19px] font-semibold tracking-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-[14px] sm:text-[15px] leading-relaxed text-muted">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CheckIcon() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}
