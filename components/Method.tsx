import { Container } from "./ui/Container";

type Pillar = {
  title: string;
  desc: string;
  Icon: () => React.ReactElement;
};

const pillars: Pillar[] = [
  {
    title: "Conversação primeiro.",
    desc: "Você fala desde a primeira aula. O foco é ativar o inglês, não decorar regras.",
    Icon: ChatIcon,
  },
  {
    title: "Currículo Oxford.",
    desc: "Estrutura comprovada, materiais oficiais e progressão clara do A1 ao C1.",
    Icon: CapIcon,
  },
  {
    title: "Feedback contínuo.",
    desc: "Correções no contexto, plano semanal e acompanhamento do seu progresso real.",
    Icon: TrendIcon,
  },
];

export function Method() {
  return (
    <section id="metodo" className="bg-surface py-24 sm:py-32">
      <Container>
        <div className="max-w-2xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">
            Método Oxford
          </p>
          <h2 className="mt-4 text-[36px] sm:text-[52px] leading-[1.05] font-semibold tracking-[-0.03em] text-foreground">
            Um método pensado
            <br />
            <span className="text-muted">para você falar.</span>
          </h2>
          <p className="mt-5 text-[18px] leading-relaxed text-muted">
            Três pilares que combinam a tradição da Oxford University Press
            com o ritmo da sua rotina.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="group rounded-3xl bg-white border border-hairline p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(10,37,64,0.2)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground/5 text-foreground">
                <p.Icon />
              </div>
              <h3 className="mt-6 text-[22px] font-semibold tracking-tight text-foreground">
                {p.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

const svgProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function ChatIcon() {
  return (
    <svg {...svgProps}>
      <path d="M4 5h16v11H8l-4 4z" />
    </svg>
  );
}

function CapIcon() {
  return (
    <svg {...svgProps}>
      <path d="M2 9.5 12 5l10 4.5L12 14z" />
      <path d="M6 11.5V16c2 1.5 4 2.25 6 2.25S16 17.5 18 16v-4.5" />
      <path d="M22 9.5V15" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg {...svgProps}>
      <path d="M3 17 9 11l4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  );
}
