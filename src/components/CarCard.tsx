import { Calendar, Fuel, Gauge, MapPin, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface CarCardProps {
  image: string;
  title: string;
  price: string;
  year: string;
  mileage: string;
  fuel: string;
  location: string;
  timeAgo: string;
  priceDiffPercent?: number | null;
}

const CarCard = ({ image, title, price, year, mileage, fuel, location, timeAgo, priceDiffPercent }: CarCardProps) => {
  const getPriceBadge = () => {
    if (priceDiffPercent == null) return null;
    if (priceDiffPercent < -5) {
      return { icon: TrendingDown, label: `${priceDiffPercent}%`, bg: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400" };
    }
    if (priceDiffPercent > 5) {
      return { icon: TrendingUp, label: `+${priceDiffPercent}%`, bg: "bg-red-500/15", text: "text-red-600 dark:text-red-400" };
    }
    return { icon: Minus, label: `~${Math.abs(priceDiffPercent)}%`, bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400" };
  };

  const badge = getPriceBadge();

  return (
    <div className="group bg-card rounded-2xl border border-border card-shadow hover:card-shadow-hover transition-all duration-300 overflow-hidden cursor-pointer">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-foreground/70 text-background text-xs font-medium backdrop-blur-sm">
          {timeAgo}
        </span>
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground truncate">{title}</h3>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-foreground">{price}</p>
          {badge && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
              <badge.icon className="w-3.5 h-3.5" />
              {badge.label}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{year}</span>
          <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" />{mileage}</span>
          <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" />{fuel}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{location}</span>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
