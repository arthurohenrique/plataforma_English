export const site = {
  name: "Reinaldo Montes",
  tagline: "Aprenda inglês de verdade.",
  phoneDisplay: "31 9 8362-6602",
  whatsappE164: "5531983626602",
  whatsappMessage:
    "Olá! Vim pelo site e gostaria de agendar uma aula experimental de inglês.",
};

export const whatsappUrl = `https://wa.me/${site.whatsappE164}?text=${encodeURIComponent(
  site.whatsappMessage,
)}`;
