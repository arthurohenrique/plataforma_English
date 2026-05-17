import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Method } from "@/components/Method";
import { Benefits } from "@/components/Benefits";
import { Teacher } from "@/components/Teacher";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Method />
        <Benefits />
        <Teacher />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
