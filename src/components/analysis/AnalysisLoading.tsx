import { useState, useEffect } from "react";
import { Car } from "lucide-react";

const tips = [
  "Visste du at 1 av 3 bruktbiler har skjulte heftelser?",
  "En EU-kontroll avdekker ikke skjulte feil — AI-analyse gjør det.",
  "Kilometerstand kan justeres — sjekk alltid historikk.",
];

const statusTexts: [number, string][] = [
  [0, "Henter annonsedata fra Finn..."],
  [15, "Sjekker kjøretøydata fra Vegvesen..."],
  [40, "Analyserer bilen med AI... dette tar litt tid"],
  [85, "Fullfører analysen..."],
  [100, "Ferdig!"],
];

const getStatusText = (pct: number) => {
  for (let i = statusTexts.length - 1; i >= 0; i--) {
    if (pct >= statusTexts[i][0]) return statusTexts[i][1];
  }
  return statusTexts[0][1];
};

interface AnalysisLoadingProps {
  loadingStep?: "scraping" | "vegvesen" | "analyzing" | "finalizing" | "done";
  fromCache?: boolean;
}

const AnalysisLoading = ({ loadingStep = "scraping", fromCache = false }: AnalysisLoadingProps) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  // Phased progress targets
  useEffect(() => {
    if (fromCache) return;

    const targets: Record<string, number> = {
      scraping: 40,
      vegvesen: 65,
      analyzing: 85,
      finalizing: 95,
      done: 100,
    };
    const target = targets[loadingStep] || 15;

    if (progress === 0) {
      setProgress(15);
      return;
    }

    if (loadingStep === "done") {
      setProgress(100);
      setTimeout(() => setVisible(false), 400);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= target) return prev;
        const remaining = target - prev;
        const step = Math.max(0.3, remaining * 0.05);
        return Math.min(prev + step, target);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [loadingStep, fromCache]);

  // Tips rotation
  useEffect(() => {
    if (fromCache) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTipIndex((i) => (i + 1) % tips.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [fromCache]);

  if (fromCache || !visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center min-h-screen px-4">
      {/* Brand logo */}
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-8">
        <Car className="w-9 h-9 text-primary-foreground" />
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-10" style={{ fontFamily: 'var(--font-heading)' }}>
        Analyserer bilen...
      </h1>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-3">
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{
            backgroundColor: "hsl(var(--muted))",
            boxShadow: "0 0 8px 1px hsl(var(--primary) / 0.15)",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out animate-pulse-glow"
            style={{
              width: `${progress}%`,
              backgroundColor: "hsl(var(--primary))",
              boxShadow:
                "0 0 12px 3px hsl(var(--primary) / 0.6), 0 0 24px 6px hsl(var(--primary) / 0.3)",
            }}
          />
        </div>
        {/* Percentage */}
        <p className="text-sm text-primary text-right mt-1.5 tabular-nums font-semibold">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Status text */}
      <p className="text-base text-muted-foreground text-center mb-8">
        {getStatusText(progress)}
      </p>

      {/* Fun fact */}
      <p
        className={`text-sm text-muted-foreground/60 italic text-center max-w-sm transition-opacity duration-300 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {tips[tipIndex]}
      </p>
    </div>
  );
};

export default AnalysisLoading;
