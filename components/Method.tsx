import { Container } from "./ui/Container";

const pillars = [
  {
    title: "Conversação primeiro.",
    desc: "Você fala desde a primeira aula. O foco é ativar o inglês, não decorar regras.",
    glyph: "💬",
  },
  {
    title: "Currículo Oxford.",
    desc: "Estrutura comprovada, materiais oficiais e progressão clara do A1 ao C1.",
    glyph: "🎓",
  },
  {
    title: "Feedback contínuo.",
    desc: "Correções no contexto, plano semanal e acompanhamento do seu progresso real.",
    glyph: "📈",
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
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground/5 text-xl">
                {p.glyph}
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
