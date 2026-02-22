import { Weight, Users, Gauge, Fuel } from "lucide-react";

interface InfoCardsProps {
  towWeight?: number | null;
  owners?: number | null;
  maxSpeed?: number | null;
  fuelConsumption?: number | null;
  electricConsumption?: number | null;
  fuelType?: string;
}

const InfoCards = ({ towWeight, owners, maxSpeed, fuelConsumption, electricConsumption, fuelType }: InfoCardsProps) => {
  const isElectric = fuelType?.toLowerCase()?.includes('elektr') || fuelType?.toLowerCase()?.includes('el');

  const getOwnerColor = (count: number) => {
    if (count <= 1) return "text-green-500";
    if (count <= 3) return "text-yellow-500";
    return "text-red-500";
  };

  const cards = [
    towWeight ? {
      icon: Weight,
      label: "Tilhengervekt",
      value: `${towWeight.toLocaleString("nb-NO")} kg`,
      color: "text-foreground",
    } : null,
    owners != null ? {
      icon: Users,
      label: "Antall eiere",
      value: `${owners} ${owners === 1 ? "eier" : "eiere"}`,
      color: getOwnerColor(owners),
    } : null,
    maxSpeed ? {
      icon: Gauge,
      label: "Maks hastighet",
      value: `${maxSpeed} km/t`,
      color: "text-foreground",
    } : null,
    (fuelConsumption || electricConsumption) ? {
      icon: Fuel,
      label: "Forbruk",
      value: isElectric && electricConsumption
        ? `${electricConsumption} kWh/100km`
        : fuelConsumption
          ? `${fuelConsumption} l/100km`
          : `${electricConsumption} kWh/100km`,
      color: "text-foreground",
    } : null,
  ].filter(Boolean) as { icon: any; label: string; value: string; color: string }[];

  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <card.icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className={`text-sm font-semibold ${card.color}`}>{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InfoCards;
