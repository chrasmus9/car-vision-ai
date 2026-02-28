const steps = [
  {
    number: "1",
    title: "Finn annonsen på Finn.no",
    description: "Kopier lenken til bruktbilen du vurderer å kjøpe og lim den inn i søkefeltet.",
  },
  {
    number: "2",
    title: "AI analyserer bilen",
    description: "Vi henter kjøretøydata fra Statens vegvesen og analyserer annonsen med kunstig intelligens. Dette tar under ett minutt.",
  },
  {
    number: "3",
    title: "Få full rapport",
    description: "Du får en detaljert rapport med risikovurdering, prisanalyse og spørsmål du bør stille selger før kjøp.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 px-4 bg-muted/40">
      <div className="max-w-5xl mx-auto text-center space-y-12">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl text-foreground">Hvordan det fungerer</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Tre enkle steg for å sjekke en bruktbil fra Finn.no med AI.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.number} className="bg-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 text-left space-y-3">
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">{s.number}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Steg {s.number}: {s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
