import { Car, Search, Sparkles } from "lucide-react";

interface AnalysisLoadingProps {
  step: "scraping" | "analyzing";
}

const AnalysisLoading = ({ step }: AnalysisLoadingProps) => {
  return (
    <div className="max-w-md mx-auto px-4 py-32 text-center space-y-8">
      <div className="relative mx-auto w-16 h-16">
        <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
          {step === "scraping" ? (
            <Search className="w-7 h-7 text-primary-foreground animate-pulse" />
          ) : (
            <Sparkles className="w-7 h-7 text-primary-foreground animate-pulse" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          {step === "scraping" ? "Henter annonsedata..." : "AI analyserer bilen..."}
        </h2>
        <p className="text-sm text-muted-foreground">
          {step === "scraping"
            ? "Vi henter all informasjon fra Finn.no-annonsen."
            : "AI-en vurderer risikoer, pris og genererer smarte spørsmål."}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Step label="Henter data" active={step === "scraping"} done={step === "analyzing"} />
        <div className="w-8 h-px bg-border" />
        <Step label="AI-analyse" active={step === "analyzing"} done={false} />
      </div>
    </div>
  );
};

const Step = ({ label, active, done }: { label: string; active: boolean; done: boolean }) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-3 h-3 rounded-full transition-all ${
        done ? "bg-primary" : active ? "bg-primary animate-pulse" : "bg-muted"
      }`}
    />
    <span className={`text-xs ${active || done ? "text-foreground font-medium" : "text-muted-foreground"}`}>
      {label}
    </span>
  </div>
);

export default AnalysisLoading;
