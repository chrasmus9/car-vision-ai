import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Helmet } from "react-helmet-async";

const faqs = [
  {
    q: "Hva er BruktbilSjekk?",
    a: "BruktbilSjekk er et AI-drevet verktøy som analyserer bruktbilannonser fra Finn.no. Vi henter data fra Statens vegvesen og bruker kunstig intelligens til å avdekke skjulte risikoer, vurdere prisen og generere spørsmål du bør stille selger.",
  },
  {
    q: "Hvordan sjekker jeg en bruktbil på Finn.no?",
    a: "Lim inn lenken til Finn.no-annonsen i søkefeltet på BruktbilSjekk og klikk Analyser bil. AI-en analyserer annonsen og henter kjøretøydata fra Statens vegvesen automatisk. Du får en full rapport på under ett minutt.",
  },
  {
    q: "Hvilke data henter BruktbilSjekk?",
    a: "Vi henter offentlig tilgjengelig informasjon fra Finn.no-annonsen og kjøretøydata fra Statens vegvesen, inkludert antall tidligere eiere, kilometerstand fra EU-kontroller, tekniske spesifikasjoner og eventuelle heftelser.",
  },
  {
    q: "Er BruktbilSjekk gratis?",
    a: "Ja, BruktbilSjekk er gratis å bruke. Du kan analysere bilannonser uten å opprette konto. Innlogging gir deg tilgang til analysehistorikk og favoritter.",
  },
  {
    q: "Hva avdekker AI-analysen?",
    a: "Analysen avdekker prisavvik i forhold til markedet, avvik mellom oppgitt og registrert kilometerstand, antall tidligere eiere, tekniske data fra Vegvesen, potensielle risikoer i annonseteksten og foreslår spørsmål du bør stille selger.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const FAQSection = () => (
  <section className="py-16 px-4">
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-3xl md:text-4xl text-foreground text-center">Ofte stilte spørsmål</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
