import { useState, useEffect } from "react";

const tips = [
  "Visste du at 1 av 3 bruktbiler har skjulte heftelser?",
  "Vi sjekker kilometerstand, eierhistorikk og kjente feil",
  "En grundig sjekk kan spare deg for tusenvis av kroner",
  "BilSjekk analyserer både tekniske og kommersielle risikoer",
];

const AnalysisLoading = () => {
  const [tipIndex, setTipIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTipIndex((i) => (i + 1) % tips.length);
        setFade(true);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-32 gap-8">
      <h1 className="text-2xl font-semibold text-foreground">Analyserer bilen...</h1>

      <div className="w-64 h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full w-1/3 rounded-full bg-primary animate-slide" />
      </div>

      <p
        className={`text-sm text-muted-foreground text-center max-w-md transition-opacity duration-300 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {tips[tipIndex]}
      </p>
    </main>
  );
};

export default AnalysisLoading;
