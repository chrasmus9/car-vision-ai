import { Calendar, Fuel, Gauge, MapPin } from "lucide-react";

interface CarCardProps {
  image: string;
  title: string;
  price: string;
  year: string;
  mileage: string;
  fuel: string;
  location: string;
  timeAgo: string;
  riskLevel: "low" | "medium" | "high";
}

const riskConfig = {
  low: { label: "Lav risiko", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", bar: "bg-emerald-500" },
  medium: { label: "Middels risiko", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", bar: "bg-amber-500" },
  high: { label: "Høy risiko", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", bar: "bg-red-500" },
};

const CarCard = ({ image, title, price, year, mileage, fuel, location, timeAgo, riskLevel }: CarCardProps) => {
  const risk = riskConfig[riskLevel];

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
        <p className="text-lg font-bold text-foreground">{price}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{year}</span>
          <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" />{mileage}</span>
          <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" />{fuel}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{location}</span>
        </div>
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Risikoer</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${risk.bg} ${risk.text}`}>
              {risk.label}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${risk.bar} transition-all`}
              style={{ width: riskLevel === "low" ? "25%" : riskLevel === "medium" ? "55%" : "85%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
