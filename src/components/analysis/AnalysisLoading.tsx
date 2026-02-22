import { useState, useEffect } from "react";

interface AnalysisLoadingProps {
  step: "scraping" | "analyzing";
  carData?: {
    title: string;
    price: string;
    imageUrl: string;
    year: number;
    mileage: string;
    fuel: string;
    gearbox: string;
    location: string;
    seller: string;
  } | null;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-muted-foreground/15 rounded animate-pulse ${className}`} />
);

const SkeletonBadges = () => (
  <div className="flex flex-wrap gap-2">
    <Skeleton className="h-6 w-24 rounded-full" />
    <Skeleton className="h-6 w-16 rounded-full" />
    <Skeleton className="h-6 w-32 rounded-full" />
    <Skeleton className="h-6 w-20 rounded-full" />
    <Skeleton className="h-6 w-28 rounded-full" />
  </div>
);

const tips = [
  "Visste du at 1 av 3 bruktbiler har skjulte heftelser?",
  "Vi sjekker kilometerstand, eierhistorikk og kjente feil",
  "En grundig sjekk kan spare deg for tusenvis av kroner",
  "BilSjekk analyserer både tekniske og kommersielle risikoer",
];

const AnalysisLoading = ({ step, carData }: AnalysisLoadingProps) => {
  const stepText = step === "scraping"
    ? "Henter annonsedata..."
    : "Analyserer bilen...";

  const [tipIndex, setTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipVisible(false);
      setTimeout(() => {
        setTipIndex((i) => (i + 1) % tips.length);
        setTipVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Car overview card with overlay */}
      <div className="bg-card rounded-2xl border border-border card-shadow overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image area with loading overlay */}
          <div className="aspect-[4/3] md:aspect-auto relative overflow-hidden bg-muted">
            {carData?.imageUrl ? (
              <img
                src={carData.imageUrl}
                alt={carData.title}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
            {/* Loading overlay on image */}
            <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center gap-4 px-6">
              <span className="text-sm font-medium text-foreground">{stepText}</span>
              {/* Indeterminate loading bar */}
              <div className="w-full max-w-xs h-1.5 rounded-full bg-muted-foreground/15 overflow-hidden">
                <div className="h-full w-1/3 rounded-full bg-primary animate-[indeterminate_1.5s_ease-in-out_infinite]" />
              </div>
              {/* Rotating tip */}
              <p
                className={`text-xs text-muted-foreground text-center max-w-[280px] transition-opacity duration-400 ${tipVisible ? "opacity-100" : "opacity-0"}`}
              >
                {tips[tipIndex]}
              </p>
            </div>
          </div>

          {/* Details area — always show skeletons for unfilled fields */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              {carData ? (
                <>
                  <h1 className="text-2xl md:text-3xl text-foreground">{carData.title}</h1>
                  <p className="text-3xl font-bold text-foreground">{carData.price}</p>
                </>
              ) : (
                <>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-9 w-40" />
                </>
              )}
            </div>

            {carData ? (
              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <span>{carData.year}</span>
                <span>{carData.mileage}</span>
                <span>{carData.fuel} · {carData.gearbox}</span>
                <span>{carData.location}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-20" />
              </div>
            )}

            <div className="pt-3 border-t border-border">
              {carData ? (
                <p className="text-sm text-muted-foreground">
                  Selger: <span className="font-medium text-foreground">{carData.seller}</span>
                </p>
              ) : (
                <Skeleton className="h-4 w-32" />
              )}
            </div>

            {/* Extra skeleton lines to fill right side */}
            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton sections matching the real layout */}
      {/* AI Summary skeleton */}
      <div className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Risk + Price grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-4">
          <Skeleton className="h-5 w-24" />
          <p className="text-sm text-muted-foreground">Risikoer</p>
          <SkeletonBadges />
        </div>
        <div className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-4">
          <Skeleton className="h-5 w-28" />
          <p className="text-sm text-muted-foreground">Høydepunkter</p>
          <SkeletonBadges />
        </div>
      </div>
    </main>
  );
};

export default AnalysisLoading;
