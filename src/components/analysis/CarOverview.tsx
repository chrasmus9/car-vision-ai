import { useState, useEffect, useCallback } from "react";
import { ExternalLink, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface CarOverviewProps {
  car: {
    title: string;
    subtitle: string;
    price: string;
    year: number;
    mileage: string;
    fuel: string;
    gearbox: string;
    seller: string;
    location: string;
    finnCode: string;
    imageUrl: string;
    images: string[];
  };
}

const CarOverview = ({ car }: CarOverviewProps) => {
  const images = car.images?.length > 0 ? car.images : car.imageUrl ? [car.imageUrl] : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user, setShowAuthModal } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!user || !car.finnCode) return;
    supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("finn_code", car.finnCode)
      .maybeSingle()
      .then(({ data }) => setIsFavorite(!!data));
  }, [user, car.finnCode]);

  const toggleFavorite = useCallback(async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!car.finnCode || favLoading) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("finn_code", car.finnCode);
        setIsFavorite(false);
      } else {
        await supabase.from("favorites").insert({
          user_id: user.id,
          finn_code: car.finnCode,
          finn_url: `https://www.finn.no/mobility/item/${car.finnCode}`,
          car_data: {
            title: car.title,
            price: car.price,
            year: car.year,
            mileage: car.mileage,
            fuel: car.fuel,
            location: car.location,
            imageUrl: car.imageUrl,
          },
        });
        setIsFavorite(true);
      }
    } finally {
      setFavLoading(false);
    }
  }, [user, car, isFavorite, favLoading, setShowAuthModal]);

  const prev = () => setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-5">
      {/* Image carousel */}
      <div className="relative w-full aspect-[16/9] md:aspect-[2.2/1] rounded-2xl overflow-hidden bg-muted">
        {images.length > 0 && (
          <img
            src={images[currentIndex]}
            alt={`${car.title} - bilde ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center hover:bg-background/80 transition-colors"
              aria-label="Forrige bilde"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={next}
              className="absolute right-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center hover:bg-background/80 transition-colors"
              aria-label="Neste bilde"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>

            {/* Counter */}
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-foreground/70 text-background text-xs font-medium backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </>
        )}

        <button
          onClick={toggleFavorite}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center hover:bg-background/80 transition-colors"
          aria-label={isFavorite ? "Fjern fra favoritter" : "Legg til i favoritter"}
        >
          <Heart className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-foreground"}`} />
        </button>
      </div>

      {/* Details below image */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl text-foreground">{car.title}</h1>
            {car.subtitle && (
              <p className="text-sm text-muted-foreground">{car.subtitle}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <a
              href={`https://www.finn.no/mobility/item/${car.finnCode}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Badge variant="outline" className="gap-1.5 cursor-pointer hover:bg-accent transition-colors px-3 py-1.5">
                <ExternalLink className="w-3 h-3" />
                Annonse
              </Badge>
            </a>
          </div>
        </div>

        {/* Price */}
        <div>
          <p className="text-xs text-muted-foreground">Totalpris</p>
          <p className="text-3xl font-bold text-foreground">{formatPrice(car.price)}</p>
        </div>

        {/* Quick specs row */}
        <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Modellår</p>
            <p className="text-sm font-semibold text-foreground">{car.year}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Kilometerstand</p>
            <p className="text-sm font-semibold text-foreground">{car.mileage}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Drivstoff</p>
            <p className="text-sm font-semibold text-foreground">{car.fuel}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Girkasse</p>
            <p className="text-sm font-semibold text-foreground">{car.gearbox}</p>
          </div>
          {car.location && (
            <div>
              <p className="text-xs text-muted-foreground">Sted</p>
              <p className="text-sm font-semibold text-foreground">{car.location}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarOverview;
