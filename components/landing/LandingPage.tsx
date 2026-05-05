"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Menu, Star, X } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/lib/config/site";

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#metodo", label: "Metodo" },
  { href: "#sobre", label: "Sobre o Prof." },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#contato", label: "Contato" },
];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

function Section({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      className={className}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

export function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="font-body text-brandText">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="/" className="flex items-center gap-2 text-brandBlue">
            <GraduationCap className="h-6 w-6" />
            <span className="font-serifTitle text-xl font-bold">{siteConfig.siteName}</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-semibold hover:text-brandRed">
                {item.label}
              </a>
            ))}
            <Link
              href="/login"
              className="rounded-full border border-brandBlue px-4 py-2 text-sm font-semibold text-brandBlue hover:bg-brandBlue hover:text-white"
            >
              Area do Aluno
            </Link>
            <a
              href="#contato"
              className="rounded-full bg-brandRed px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
            >
              Agendar Aula Experimental
            </a>
          </div>

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="rounded-lg border border-slate-200 p-2 text-brandBlue md:hidden"
            aria-label="Abrir menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {isOpen && (
          <div className="border-t border-slate-100 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((item) => (
                <a key={item.href} href={item.href} className="font-semibold" onClick={() => setIsOpen(false)}>
                  {item.label}
                </a>
              ))}
              <Link href="/login" className="font-semibold text-brandBlue">
                Area do Aluno
              </Link>
              <a href="#contato" className="rounded-lg bg-brandRed px-4 py-2 text-center font-semibold text-white">
                Agendar Aula Experimental
              </a>
            </div>
          </div>
        )}
      </header>

      <Section id="inicio" className="bg-gradient-to-b from-white to-brandLight/50 px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-brandGold/40 bg-brandGold/15 px-4 py-1 text-sm font-semibold text-brandBlue">
              Aulas Online | Metodo Oxford | Resultados Reais
            </p>
            <h1 className="font-serifTitle text-4xl leading-tight text-brandBlue md:text-6xl">
              Aprenda <span className="bg-brush-red text-brandRed">Ingles</span> de Verdade com Professor Particular
            </h1>
            <div className="flex flex-wrap gap-2">
              {["Aulas Online", "Metodo Oxford Comprovado", "Horarios Flexiveis"].map((tag) => (
                <span key={tag} className="rounded-full bg-brandBlue px-3 py-1 text-xs font-semibold text-white">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#contato"
                className="rounded-full bg-brandRed px-7 py-3 text-center font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              >
                Agendar Minha Aula Experimental
              </a>
              <a
                href="#metodo"
                className="rounded-full border border-brandBlue px-7 py-3 text-center font-semibold text-brandBlue hover:bg-brandBlue hover:text-white"
              >
                Conhecer o Metodo
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brandBlue to-brandRed p-1 shadow-soft">
              <div className="aspect-video rounded-[22px] bg-white/95 p-6">
                <div className="h-full rounded-2xl bg-gradient-to-br from-brandBlue/15 via-white to-brandRed/15 p-5">
                  <div className="grid h-full grid-cols-[1fr_auto] items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-brandBlue">Videochamada ao vivo</p>
                      <p className="mt-2 text-2xl font-bold text-brandText">Aula personalizada</p>
                      <p className="mt-1 text-sm">Foco em conversacao e progresso semanal.</p>
                    </div>
                    <div className="rounded-xl bg-brandBlue px-3 py-2 text-xs font-semibold text-white">ONLINE</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brandBlue">Parceiro Oficial</p>
              <p className="mt-1 text-lg font-bold text-brandBlue">Oxford University Press</p>
            </div>
          </div>
        </div>
      </Section>

      <Section id="metodo" className="bg-brandLight px-4 py-16 md:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="text-center font-serifTitle text-3xl text-brandBlue md:text-4xl">
            Metodo Comprovado. Resultados Reais.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { icon: "📚", title: "Metodo Oxford", text: "Material didatico reconhecido mundialmente." },
              { icon: "🎯", title: "Foco em Conversacao", text: "Voce fala desde a primeira aula." },
              { icon: "📅", title: "Horarios Flexiveis", text: "Aulas que cabem na sua agenda." },
            ].map((item) => (
              <motion.article
                key={item.title}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
              >
                <p className="text-3xl">{item.icon}</p>
                <h3 className="mt-4 text-xl font-bold text-brandBlue">{item.title}</h3>
                <p className="mt-2 text-sm">{item.text}</p>
              </motion.article>
            ))}
          </div>
          <ul className="mt-8 grid gap-2 text-sm font-semibold md:grid-cols-2">
            {["Horarios Flexiveis", "Foco em Conversacao", "Aulas Individuais", "Material Didatico Incluso"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-brandGold">✓</span> {item}
                </li>
              ),
            )}
          </ul>
        </div>
      </Section>

      <Section id="publico" className="bg-white px-4 py-16 md:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serifTitle text-3xl text-brandBlue md:text-4xl">
              Quer Falar <span className="bg-brush-gold text-brandBlue">Ingles</span> de Verdade?
            </h2>
            <ul className="mt-6 space-y-3 text-sm font-semibold">
              <li>
                <span className="text-brandGold">✓</span> Professor com Formacao em Letras/Ingles
              </li>
              <li>
                <span className="text-brandGold">✓</span> Experiencia em Curso Online
              </li>
              <li>
                <span className="text-brandGold">✓</span> Alunos em empresas multinacionais
              </li>
            </ul>
            <p className="mt-4 italic text-brandBlue">Aprenda ingles para o mundo corporativo!</p>
          </div>
          <div className="space-y-3">
            <span className="inline-block rounded-full bg-brandRed px-4 py-2 text-sm font-semibold text-white">
              Viagens Internacionais
            </span>
            <br />
            <span className="inline-block rounded-full bg-brandBlue px-4 py-2 text-sm font-semibold text-white">
              Progredir no Trabalho
            </span>
            <br />
            <span className="inline-block rounded-full bg-[#8E2A20] px-4 py-2 text-sm font-semibold text-white">
              Aulas Individuais
            </span>
          </div>
        </div>
      </Section>

      <Section id="sobre" className="bg-brandBlue px-4 py-16 text-white md:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[auto_1fr]">
          <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-brandGold bg-white/10 text-4xl font-bold">
            PN
          </div>
          <div>
            <h2 className="font-serifTitle text-3xl">{siteConfig.professor.fullName}</h2>
            <p className="mt-2 text-sm text-white/85">Formacao: Letras/Ingles - {siteConfig.professor.university}</p>
            <p className="mt-1 text-sm text-white/85">Experiencia: {siteConfig.professor.yearsOnline} de ensino online</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {siteConfig.professor.specialties.map((item) => (
                <span key={item} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {siteConfig.professor.achievements.map((item) => (
                <div key={item.label} className="rounded-xl bg-white/10 p-4">
                  <p className="text-2xl font-bold text-brandGold">{item.value}</p>
                  <p className="text-sm text-white/80">{item.label}</p>
                </div>
              ))}
            </div>
            <blockquote className="mt-6 border-l-4 border-brandGold pl-4 text-sm italic text-white/90">
              {siteConfig.professor.quote}
            </blockquote>
            <a href="#bio-completa" className="mt-5 inline-flex items-center gap-2 font-semibold text-brandGold">
              <Star className="h-4 w-4" /> Conhecer o Professor
            </a>
          </div>
        </div>
      </Section>

      <Section id="depoimentos" className="bg-brandLight px-4 py-16 md:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="text-center font-serifTitle text-3xl text-brandBlue">O que dizem nossos alunos</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                name: "Marina S.",
                context: "Analista Financeira",
                text: "Ganhei confianca para conduzir reunioes em ingles no trabalho.",
              },
              {
                name: "Lucas R.",
                context: "Engenheiro de Software",
                text: "As aulas sao objetivas e o progresso fica claro a cada semana.",
              },
              {
                name: "Patricia A.",
                context: "RH Multinacional",
                text: "Metodo excelente para quem precisa falar com naturalidade no dia a dia.",
              },
            ].map((item) => (
              <motion.article
                key={item.name}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
              >
                <div className="mb-4 h-12 w-12 rounded-full bg-brandBlue/15" />
                <p className="font-semibold text-brandBlue">{item.name}</p>
                <p className="text-xs text-slate-500">{item.context}</p>
                <p className="mt-3 text-sm">{item.text}</p>
                <p className="mt-3 text-brandGold">⭐⭐⭐⭐⭐</p>
              </motion.article>
            ))}
          </div>
        </div>
      </Section>

      <Section id="passos" className="bg-white px-4 py-16 md:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="text-center font-serifTitle text-3xl text-brandBlue">Comece em 3 Passos Simples</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              "📋 Agende sua aula experimental gratuita",
              "🎯 Diagnostico do seu nivel de ingles",
              "📚 Estude com metodo personalizado",
            ].map((step, idx) => (
              <article key={step} className="relative rounded-2xl border border-slate-200 bg-brandLight p-6">
                <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brandBlue text-sm font-bold text-white">
                  {idx + 1}
                </span>
                <p className="text-sm font-semibold">{step}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section id="contato" className="bg-gradient-to-br from-brandBlue to-brandRed px-4 py-16 text-white md:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serifTitle text-4xl">Agende sua Aula Experimental!</h2>
            <p className="mt-2 text-white/85">Primeira aula gratuita. Sem compromisso.</p>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsappRaw}`}
              className="mt-6 inline-block rounded-full bg-brandGold px-6 py-3 font-bold text-brandBlue"
            >
              WhatsApp: {siteConfig.contact.whatsappLabel}
            </a>
          </div>
          <form className="space-y-3 rounded-2xl bg-white/10 p-6 backdrop-blur">
            <input placeholder="Nome completo" className="w-full rounded-lg border border-white/30 bg-white/5 p-3" />
            <input
              placeholder="WhatsApp / Telefone"
              className="w-full rounded-lg border border-white/30 bg-white/5 p-3"
            />
            <select className="w-full rounded-lg border border-white/30 bg-white/5 p-3">
              <option>Melhor horario para contato</option>
              <option>Manha</option>
              <option>Tarde</option>
              <option>Noite</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              type="button"
              className="w-full rounded-lg bg-brandGold px-4 py-3 font-bold text-brandBlue"
            >
              Quero Minha Aula Gratuita
            </motion.button>
          </form>
        </div>
      </Section>

      <footer className="bg-brandFooter px-4 py-10 text-white md:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-6 md:grid-cols-3">
          <div>
            <p className="font-serifTitle text-xl">{siteConfig.siteName}</p>
            <p className="mt-2 text-sm text-white/75">{siteConfig.tagline}</p>
          </div>
          <div>
            <p className="font-semibold">Links Rapidos</p>
            <div className="mt-2 space-y-1 text-sm text-white/80">
              <a href="#inicio" className="block">
                Inicio
              </a>
              <a href="#metodo" className="block">
                Metodo
              </a>
              <a href="#contato" className="block">
                Contato
              </a>
            </div>
          </div>
          <div>
            <p className="font-semibold">Contato</p>
            <a className="mt-2 block text-sm text-white/80" href={`https://wa.me/${siteConfig.contact.whatsappRaw}`}>
              {siteConfig.contact.whatsappLabel}
            </a>
            <p className="text-sm text-white/80">{siteConfig.contact.email}</p>
          </div>
        </div>
        <p className="mx-auto mt-8 w-full max-w-7xl border-t border-white/15 pt-6 text-center text-xs text-white/65">
          © 2025 - {siteConfig.professor.fullName}. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  );
}
