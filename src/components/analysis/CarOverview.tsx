import { ExternalLink, MapPin, Calendar, Gauge, Fuel } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <div className="bg-card rounded-2xl border border-border card-shadow overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
          <img
            src={car.imageUrl}
            alt={car.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6 md:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl text-foreground">{car.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{car.subtitle}</p>
              </div>
              <a
                href={`https://www.finn.no/mobility/item/${car.finnCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Badge variant="outline" className="gap-1.5 cursor-pointer hover:bg-accent transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  Finn.no
                </Badge>
              </a>
            </div>
            <p className="text-3xl font-bold text-foreground">{car.price}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{car.year}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Gauge className="w-4 h-4 text-primary" />
              <span>{car.mileage}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Fuel className="w-4 h-4 text-primary" />
              <span>{car.fuel} · {car.gearbox}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{car.location}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border text-sm text-muted-foreground">
            Selger: <span className="font-medium text-foreground">{car.seller}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarOverview;
