import { Container } from "./ui/Container";

const testimonials = [
  {
    quote:
      "Em três meses já estava em reunião com o time dos EUA sem travar. Mudou minha carreira.",
    name: "Marina S.",
    role: "Product Manager",
  },
  {
    quote:
      "Foco em conversação real desde o primeiro dia. Aulas que cabem na minha rotina.",
    name: "Rafael L.",
    role: "Engenheiro",
  },
  {
    quote:
      "Viajei para o Canadá e me virei perfeitamente. O método Oxford realmente funciona.",
    name: "Ana C.",
    role: "Designer",
  },
];

export function Testimonials() {
  return (
    <section id="depoimentos" className="bg-background py-24 sm:py-32">
      <Container>
        <div className="max-w-2xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">
            Depoimentos
          </p>
          <h2 className="mt-4 text-[36px] sm:text-[52px] leading-[1.05] font-semibold tracking-[-0.03em] text-foreground">
            Resultados reais.
            <br />
            <span className="text-muted">De alunos reais.</span>
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between rounded-3xl border border-hairline bg-white p-7 sm:p-8 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(10,37,64,0.18)]"
            >
              <blockquote className="text-[18px] leading-relaxed font-medium tracking-tight text-foreground">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3 border-t border-hairline pt-5">
                <span className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-deep to-accent" />
                <div>
                  <p className="text-[14px] font-semibold text-foreground">{t.name}</p>
                  <p className="text-[12px] text-muted">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
