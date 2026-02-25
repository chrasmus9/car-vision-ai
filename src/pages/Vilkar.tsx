import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Vilkar = () => (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    <Navbar />
    <main className="flex-1 max-w-3xl mx-auto px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Vilkår og betingelser</h1>
      <p className="lead">Vilkår for bruk av BruktbilSjekk sine tjenester.</p>

      <h2>1. Aksept av vilkår</h2>
      <p>Ved å bruke BruktbilSjekk («Tjenesten») aksepterer du disse vilkårene. Hvis du ikke godtar vilkårene, ber vi deg om å ikke bruke Tjenesten.</p>

      <h2>2. Om tjenesten</h2>
      <p>BruktbilSjekk er en AI-drevet tjeneste som analyserer bruktbilannonser fra Finn.no og henter kjøretøydata fra Statens vegvesen, for å hjelpe potensielle bilkjøpere med å avdekke risikoer og ta bedre beslutninger.</p>
      <p>Tjenesten tilbyr:</p>
      <ul>
        <li>Automatisk analyse av Finn.no-bilannonser</li>
        <li>Kjøretøyhistorikk og tekniske data fra Statens vegvesen</li>
        <li>Risikovurdering og prisanalyse</li>
        <li>Lagring av tidligere analyser (for innloggede brukere)</li>
      </ul>

      <h2>3. Brukerkontoer</h2>
      <p>For å få tilgang til funksjoner som analysehistorikk og favoritter, må du opprette en brukerkonto. Du er ansvarlig for å holde kontoinformasjonen din sikker og all aktivitet under din konto.</p>

      <h2>4. Bruk av tjenesten</h2>
      <p>Du godtar å bruke Tjenesten kun til lovlige formål. Du godtar å ikke:</p>
      <ul>
        <li>Bruke automatiserte verktøy for å samle inn data fra Tjenesten</li>
        <li>Forsøke å få uautorisert tilgang til Tjenestens systemer</li>
        <li>Overføre skadelig kode eller programvare</li>
        <li>Bruke Tjenesten på en måte som bryter gjeldende lover eller regler</li>
      </ul>

      <h2>5. Ansvarsfraskrivelse</h2>
      <p><strong>BruktbilSjekk er et støtteverktøy, ikke profesjonell rådgivning.</strong></p>
      <p>Analysene erstatter ikke:</p>
      <ul>
        <li>Fysisk besiktigelse av kjøretøyet</li>
        <li>Profesjonell mekanisk vurdering</li>
        <li>Egne undersøkelser og due diligence</li>
      </ul>
      <p>Vi tar ikke ansvar for:</p>
      <ul>
        <li>Eventuelle feil eller mangler i analysene</li>
        <li>Beslutninger tatt basert på informasjon fra Tjenesten</li>
        <li>Økonomiske tap som følge av bruk av Tjenesten</li>
        <li>Nøyaktigheten av data hentet fra Finn.no eller Statens vegvesen</li>
      </ul>

      <h2>6. Immaterielle rettigheter</h2>
      <p>Alt innhold, design og kode på Tjenesten tilhører BruktbilSjekk. Du får en begrenset, ikke-eksklusiv rett til å bruke Tjenesten for personlige, ikke-kommersielle formål.</p>

      <h2>7. Tredjepartstjenester</h2>
      <p>Tjenesten henter data fra Finn.no og Statens vegvesen. Vi er ikke ansvarlige for innhold eller endringer hos disse tredjepartene. Tjenesten kan også inneholde lenker til partnere (forsikring, finansiering) — vi er ikke ansvarlige for deres innhold eller praksis.</p>

      <h2>8. Endringer i tjenesten</h2>
      <p>Vi forbeholder oss retten til å endre, suspendere eller avslutte Tjenesten når som helst. Ved vesentlige endringer vil vi varsle deg via Tjenesten eller e-post.</p>

      <h2>9. Oppsigelse</h2>
      <p>Du kan slutte å bruke Tjenesten når som helst. Vi kan avslutte eller suspendere din tilgang dersom du bryter disse vilkårene.</p>

      <h2>10. Ansvarsbegrensning</h2>
      <p>BruktbilSjekk sitt totale ansvar overfor deg skal ikke overstige beløpet du har betalt for Tjenesten de siste 12 månedene, eller NOK 1 000 dersom du ikke har betalt noe.</p>

      <h2>11. Gjeldende lov og verneting</h2>
      <p>Disse vilkårene er underlagt norsk lov. Eventuelle tvister skal søkes løst gjennom forhandlinger. Dersom dette ikke fører frem, avgjøres tvisten av norske domstoler.</p>

      <h2>12. Kontakt</h2>
      <p>Har du spørsmål om disse vilkårene, kontakt oss på <a href="mailto:hei@bruktbilsjekk.no">hei@bruktbilsjekk.no</a></p>
      <p className="text-muted-foreground text-sm">Sist oppdatert: februar 2026</p>
    </main>
    <Footer />
  </div>
);

export default Vilkar;
