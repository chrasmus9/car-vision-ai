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
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-4">
      {/* Brand logo */}
      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-6">
        <Car className="w-7 h-7 text-primary-foreground" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
        Analyserer bilen...
      </h1>

      {/* Progress bar */}
      <div className="w-full max-w-[400px] mb-2">
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              boxShadow: "0 0 8px hsl(var(--primary) / 0.5), 0 0 20px hsl(var(--primary) / 0.2)",
            }}
          />
        </div>
        {/* Percentage */}
        <p className="text-xs text-primary text-right mt-1 tabular-nums">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Status text */}
      <p className="text-sm text-muted-foreground text-center mb-6">
        {getStatusText(progress)}
      </p>

      {/* Fun fact */}
      <p
        className={`text-xs text-muted-foreground/60 italic text-center max-w-sm transition-opacity duration-300 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {tips[tipIndex]}
      </p>
    </div>
  );
};

export default AnalysisLoading;
