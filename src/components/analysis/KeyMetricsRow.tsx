import { Weight, Users, Gauge, Fuel, Zap } from "lucide-react";

interface KeyMetricsRowProps {
  towWeight?: number | null;
  owners?: number | null;
  maxSpeed?: number | null;
  fuelConsumption?: number | null;
  rekkevidde?: string | null;
  isElectric: boolean;
}

const KeyMetricsRow = ({ towWeight, owners, maxSpeed, fuelConsumption, rekkevidde, isElectric }: KeyMetricsRowProps) => {
  const getOwnerColor = (count: number | null | undefined) => {
    if (count == null) return "";
    if (count <= 1) return "text-green-600 dark:text-green-400";
    if (count <= 3) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const cards = [
    {
      icon: Weight,
      label: "Maks tilhengervekt",
      sublabel: "m/bremser",
      value: towWeight ? `${towWeight.toLocaleString("nb-NO")} kg` : "—",
      color: "text-foreground",
    },
    {
      icon: Users,
      label: "Antall eiere",
      sublabel: null,
      value: owners != null ? `${owners} ${owners === 1 ? "eier" : "eiere"}` : "—",
      color: getOwnerColor(owners) || "text-foreground",
    },
    {
      icon: Gauge,
      label: "Maks hastighet",
      sublabel: null,
      value: maxSpeed ? `${maxSpeed} km/t` : "—",
      color: "text-foreground",
    },
    isElectric
      ? {
          icon: Zap,
          label: "Rekkevidde (WLTP)",
          sublabel: null,
          value: rekkevidde ? rekkevidde.replace(/\s*km\s*/i, "").trim() + " km" : "—",
          color: "text-foreground",
        }
      : {
          icon: Fuel,
          label: "Forbruk (blandet)",
          sublabel: null,
          value: fuelConsumption ? `${fuelConsumption} l/100km` : "—",
          color: "text-foreground",
        },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <div key={i} className="bg-card rounded-xl border border-border card-shadow p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <card.icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground leading-tight">
              {card.label}
              {card.sublabel && <span className="block text-[10px]">{card.sublabel}</span>}
            </p>
            <p className={`text-sm font-semibold ${card.color}`}>{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KeyMetricsRow;
