import { useAuth } from "./AuthProvider";
import { useFavorites } from "./FavoritesProvider";
import { Link } from "react-router-dom";
import CarCard from "./CarCard";
import CarCarousel, { CarCarouselSlide } from "./CarCarousel";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const PlaceholderCard = () => (
  <div className="bg-muted/40 rounded-2xl border border-border overflow-hidden">
    <div className="aspect-[16/10] bg-muted/60" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-muted/60 rounded w-3/4" />
      <div className="h-5 bg-muted/60 rounded w-1/2" />
      <div className="flex gap-4">
        <div className="h-3 bg-muted/60 rounded w-12" />
        <div className="h-3 bg-muted/60 rounded w-16" />
        <div className="h-3 bg-muted/60 rounded w-10" />
      </div>
    </div>
  </div>
);

const FavoritesSection = () => {
  const { user, setShowAuthModal } = useAuth();
  const { favorites } = useFavorites();

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Akkurat nå";
    if (mins < 60) return `${mins} min siden`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}t siden`;
    return `${Math.floor(hours / 24)}d siden`;
  };

  if (!user) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-foreground mb-8">Dine favoritter</h2>
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 blur-[2px] opacity-50 pointer-events-none select-none">
              {[1, 2, 3, 4].map((i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <Heart className="w-10 h-10 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold text-foreground">Ikke glem en bil du likte</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Logg inn for å lagre favoritter og sammenligne biler.
              </p>
              <Button
                className="mt-4 gap-2"
                variant="default"
                onClick={() => setShowAuthModal(true)}
              >
                Lagre favoritter
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (favorites.length === 0) return null;

  return (
    <CarCarousel title="Dine favoritter">
      {favorites.map((item) => {
        const car = item.car_data as any;
        const url = item.finn_url || `https://www.finn.no/mobility/item/${item.finn_code}`;
        return (
          <CarCarouselSlide key={item.finn_code}>
            <Link to={`/analyse?url=${encodeURIComponent(url)}`}>
              <CarCard
                image={car?.imageUrl || car?.image_url || "/placeholder.svg"}
                title={car?.title || "Ukjent bil"}
                price={car?.price || "–"}
                year={car?.year?.toString() || "–"}
                mileage={car?.mileage || "–"}
                fuel={car?.fuel || "–"}
                location={car?.location || "–"}
                timeAgo={timeAgo(item.created_at)}
                finnCode={item.finn_code}
                finnUrl={url}
                carData={car}
              />
            </Link>
          </CarCarouselSlide>
        );
      })}
    </CarCarousel>
  );
};

export default FavoritesSection;
