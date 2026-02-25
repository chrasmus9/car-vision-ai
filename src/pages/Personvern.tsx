import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Personvern = () => (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    <Navbar />
    <main className="flex-1 max-w-3xl mx-auto px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Personvernerklæring</h1>
      <p className="lead">BruktbilSjekk sin policy for personvern og håndtering av personopplysninger.</p>

      <h2>Introduksjon</h2>
      <p>BruktbilSjekk («vi», «oss», «vår») er opptatt av å beskytte og respektere ditt personvern. Denne personvernerklæringen beskriver hvordan vi samler inn, bruker og behandler dine personopplysninger når du bruker vår tjeneste for å analysere bruktbilannonser. Vi overholder norsk personvernlovgivning, inkludert personopplysningsloven og GDPR.</p>

      <h2>Behandlingsansvarlig</h2>
      <p>BruktbilSjekk er behandlingsansvarlig for personopplysninger som samles inn gjennom våre tjenester. Kontakt: <a href="mailto:hei@bruktbilsjekk.no">hei@bruktbilsjekk.no</a></p>

      <h2>Hvilke personopplysninger vi samler inn</h2>
      <ul>
        <li>E-postadresse (ved innlogging)</li>
        <li>Analysehistorikk (Finn-lenker du har analysert)</li>
        <li>Favoritter og lagrede biler</li>
        <li>Tekniske data som nettlesertype og IP-adresse</li>
      </ul>

      <h2>Formålet med behandlingen</h2>
      <ul>
        <li>Å levere bilanalyser basert på data fra Finn.no og Statens vegvesen</li>
        <li>Å lagre din analysehistorikk og favoritter</li>
        <li>Å forbedre tjenesten og brukeropplevelsen</li>
        <li>Å sende deg relevante tilbud fra partnere (forsikring, finansiering) dersom du samtykker til dette</li>
      </ul>

      <h2>Rettslig grunnlag</h2>
      <ul>
        <li>Ditt samtykke ved opprettelse av konto</li>
        <li>Nødvendig for å oppfylle vår avtale med deg om å levere analyser</li>
        <li>Vår legitime interesse i å drive og forbedre tjenesten</li>
        <li>Ditt eksplisitte samtykke for deling med leadpartnere</li>
      </ul>

      <h2>Deling av personopplysninger</h2>
      <p>Vi deler kun dine personopplysninger med tredjeparter når du aktivt har samtykket til dette.</p>
      <p><strong>Forsikring og finansiering:</strong> Dersom du klikker på tilbud fra våre partnere (forsikringsselskaper, banker), videresendes du til deres nettsider. Vi deler ingen personopplysninger uten ditt eksplisitte samtykke.</p>
      <p><strong>Tekniske leverandører:</strong> Vi benytter sikre skytjenester for datalagring. Disse behandler personopplysninger på våre vegne i henhold til databehandleravtaler.</p>

      <h2>Lagring og sletting</h2>
      <ul>
        <li>Analysehistorikk lagres inntil du sletter kontoen din</li>
        <li>Ved sletting av konto fjernes alle personopplysninger innen 30 dager</li>
      </ul>

      <h2>Dine rettigheter</h2>
      <ul>
        <li>Rett til innsyn i personopplysningene vi har om deg</li>
        <li>Rett til å få opplysningene rettet eller slettet</li>
        <li>Rett til å begrense behandlingen</li>
        <li>Rett til å protestere mot behandlingen</li>
        <li>Rett til dataportabilitet</li>
        <li>Rett til å trekke tilbake samtykke når som helst</li>
      </ul>
      <p>For å utøve dine rettigheter, kontakt oss på <a href="mailto:hei@bruktbilsjekk.no">hei@bruktbilsjekk.no</a>. Vi besvarer henvendelser innen 30 dager.</p>

      <h2>Klageadgang</h2>
      <p>Du har rett til å klage til Datatilsynet dersom du mener vi behandler personopplysninger i strid med lovgivningen. Mer informasjon på <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer">www.datatilsynet.no</a>.</p>

      <h2>Endringer</h2>
      <p>Vi kan oppdatere denne erklæringen ved behov. Vesentlige endringer varsles på nettsiden.</p>
      <p className="text-muted-foreground text-sm">Sist oppdatert: februar 2026</p>
    </main>
    <Footer />
  </div>
);

export default Personvern;
