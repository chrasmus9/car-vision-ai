import { useState, useEffect, useRef } from "react";

const tips = [
  "Visste du at 1 av 3 bruktbiler har skjulte heftelser?",
  "Vi sjekker kilometerstand, eierhistorikk og kjente feil",
  "En grundig sjekk kan spare deg for tusenvis av kroner",
  "BilSjekk analyserer både tekniske og kommersielle risikoer",
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
    }, 5000);
    return () => clearInterval(interval);
  }, [fromCache]);

  if (fromCache || !visible) return null;

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-32 gap-6">
      {/* Full-width progress bar */}
      <div className="fixed top-[64px] left-0 right-0 z-50">
        <div
          className="h-[3px] bg-primary transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            boxShadow: "0 0 8px hsl(var(--primary) / 0.5), 0 0 20px hsl(var(--primary) / 0.2)",
          }}
        />
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Analyserer bilen...</h1>
      <p className="text-sm text-muted-foreground text-center">{getStatusText(progress)}</p>
      <p
        className={`text-xs text-muted-foreground/70 text-center max-w-md transition-opacity duration-300 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {tips[tipIndex]}
      </p>
    </main>
  );
};

export default AnalysisLoading;
