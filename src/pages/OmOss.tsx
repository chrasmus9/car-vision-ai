import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const OmOss = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Om BruktbilSjekk – AI-analyse av bruktbiler</title>
      <meta name="description" content="BruktbilSjekk er et AI-drevet verktøy som hjelper nordmenn å ta tryggere beslutninger når de kjøper bruktbil fra Finn.no." />
      <link rel="canonical" href="https://bruktbilsjekk.no/om-oss" />
    </Helmet>
    <Navbar />
    <main className="max-w-3xl mx-auto px-4 py-16">
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <h1>Om BruktbilSjekk</h1>
        <p>BruktbilSjekk er et AI-drevet verktøy som hjelper nordmenn å ta tryggere beslutninger når de kjøper bruktbil.</p>

        <h2>Hva vi gjør</h2>
        <p>Vi analyserer bruktbilannonser fra Finn.no og kombinerer dette med offentlig tilgjengelig kjøretøydata fra Statens vegvesen. Resultatet er en detaljert rapport som avdekker skjulte risikoer, vurderer prisen mot markedet og genererer relevante spørsmål du bør stille selger.</p>

        <h2>Hvorfor vi laget BruktbilSjekk</h2>
        <p>Å kjøpe bruktbil er en av de største investeringene mange gjør. Likevel er det lett å bli lurt av en pen annonse. Vi ønsket å gi vanlige folk tilgang til den samme informasjonen som profesjonelle bilhandlere har.</p>

        <h2>Kontakt</h2>
        <p>E-post: <a href="mailto:hei@bruktbilsjekk.no">hei@bruktbilsjekk.no</a></p>

        <p className="text-sm text-muted-foreground">Sist oppdatert: februar 2026</p>
      </article>
    </main>
    <Footer />
  </div>
);

export default OmOss;
