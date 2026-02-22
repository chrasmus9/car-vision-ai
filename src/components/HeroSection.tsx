import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (!url.trim()) {
      toast({
        title: "Mangler lenke",
        description: "Lim inn en Finn.no-lenke for å starte analysen.",
        variant: "destructive",
      });
      return;
    }
    if (!url.includes("finn.no")) {
      toast({
        title: "Ugyldig lenke",
        description: "Vennligst lim inn en gyldig Finn.no bil-annonse.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/analyse?url=${encodeURIComponent(url)}`);
  };

  return (
    <section className="relative py-20 md:py-32 px-4">
      <div className="absolute inset-0 hero-gradient" />
      <div className="relative max-w-3xl mx-auto text-center space-y-6">
        <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
          AI for bilkjøp
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground leading-[1.1]">
          Unngå overraskelser når du kjøper bil
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
          AI-analyse av bilannonser som avdekker skjulte risikoer og spørsmål du bør stille før kjøp.
        </p>

        <div className="max-w-2xl mx-auto pt-4">
          <div className="relative flex items-center bg-card rounded-2xl border border-border input-shadow focus-within:input-shadow-focus focus-within:border-primary/40 transition-all duration-300">
            <div className="pl-5 pr-2">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 py-3">
              <label className="block text-xs font-medium text-muted-foreground text-left pl-1 mb-0.5">
                Bil-annonse
              </label>
              <input
                type="text"
                placeholder="Lim inn Finn-kode eller Finn-lenke..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 outline-none text-sm md:text-base pl-1"
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
            </div>
            <div className="pr-3">
              <Button
                onClick={handleAnalyze}
                className="rounded-xl gap-2 px-5"
                size="lg"
              >
                Analyser bil
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 max-w-lg mx-auto">
            BilSjekk.ai er et støtteverktøy for bilkjøp, men erstatter ikke profesjonell rådgivning. Alle beslutninger må baseres på egen research.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
