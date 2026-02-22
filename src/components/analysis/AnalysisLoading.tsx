import { useState, useEffect } from "react";
import { Car } from "lucide-react";

const statusTexts: [number, string][] = [
  [0, "Finner annonsen på Finn... 🔍"],
  [15, "Sjekker kjøretøyhistorikk hos Vegvesen... 🏛️"],
  [45, "AI-en analyserer bilen nøye... dette er den viktige delen ⚡"],
  [90, "Setter sammen rapporten din... nesten klar! 🎯"],
  [100, "Analysen er klar! 🚗✅"],
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
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  // Phased progress targets
  useEffect(() => {
    if (fromCache) return;

    const targets: Record<string, number> = {
      scraping: 45,
      vegvesen: 70,
      analyzing: 90,
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
      <p className="text-base text-muted-foreground text-center">
        {getStatusText(progress)}
      </p>
    </div>
  );
};

export default AnalysisLoading;
