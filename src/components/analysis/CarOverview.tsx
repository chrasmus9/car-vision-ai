import { ExternalLink, MapPin, Calendar, Gauge, Fuel, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

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
  };
}

const CarOverview = ({ car }: CarOverviewProps) => {
  return (
    <div className="space-y-5">
      {/* Full-width image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[2.2/1] rounded-2xl overflow-hidden bg-muted">
        <img
          src={car.imageUrl}
          alt={car.title}
          className="w-full h-full object-cover"
        />
        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center hover:bg-background/80 transition-colors">
          <Heart className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Details below image */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{car.seller}</p>
            <h1 className="text-2xl md:text-3xl text-foreground">{car.title}</h1>
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
