import { Shield, FileSearch, MessageCircleQuestion, TrendingUp } from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Dyp analyse",
    description: "Vi scanner annonsen og gir deg en komplett oversikt over bilens historikk og tilstand.",
  },
  {
    icon: Shield,
    title: "Risikovurdering",
    description: "AI-drevet risikoanalyse som avdekker potensielle problemer før du kjøper.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Smarte spørsmål",
    description: "Få skreddersydde spørsmål du bør stille selger basert på annonsen.",
  },
  {
    icon: TrendingUp,
    title: "Prisanalyse",
    description: "Sammenligner prisen mot markedet og gir deg en rettferdig prisvurdering.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 px-4 bg-muted/40">
      <div className="max-w-5xl mx-auto text-center space-y-12">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl text-foreground">Hvordan det fungerer</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Lim inn en Finn.no-lenke, og la AI-en gjøre jobben for deg.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 text-left space-y-3"
            >
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
