import { Weight, Users, Gauge, Fuel, Zap, BatteryCharging } from "lucide-react";

interface KeyMetricsRowProps {
  towWeight?: number | null;
  owners?: number | null;
  maxSpeed?: number | null;
  fuelConsumption?: number | null;
  rekkevidde?: string | null;
  isElectric: boolean;
  electricConsumption?: number | null;
  fuelType?: string;
}

const KeyMetricsRow = ({ towWeight, owners, maxSpeed, fuelConsumption, rekkevidde, isElectric, electricConsumption, fuelType }: KeyMetricsRowProps) => {
  const getOwnerColor = (count: number | null | undefined) => {
    if (count == null) return "";
    if (count <= 1) return "text-green-600 dark:text-green-400";
    if (count <= 3) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getOwnerSublabel = (count: number | null | undefined) => {
    if (count == null) return null;
    if (count <= 1) return "Få eiere";
    if (count <= 3) return "Normalt";
    return "Mange eiere";
  };

  const isDiesel = fuelType?.toLowerCase()?.includes("diesel") || false;

  const getFuelColor = (val: number | null | undefined) => {
    if (val == null) return "";
    if (isElectric) {
      if (val < 18) return "text-green-600 dark:text-green-400";
      if (val <= 22) return "text-yellow-600 dark:text-yellow-400";
      return "text-red-600 dark:text-red-400";
    }
    if (isDiesel) {
      if (val < 5) return "text-green-600 dark:text-green-400";
      if (val <= 7) return "text-yellow-600 dark:text-yellow-400";
      return "text-red-600 dark:text-red-400";
    }
    // Petrol
    if (val < 6) return "text-green-600 dark:text-green-400";
    if (val <= 9) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getFuelSublabel = (val: number | null | undefined) => {
    if (val == null) return null;
    if (isElectric) {
      if (val < 18) return "Lavt forbruk";
      if (val <= 22) return "Middels forbruk";
      return "Høyt forbruk";
    }
    if (isDiesel) {
      if (val < 5) return "Lavt forbruk";
      if (val <= 7) return "Middels forbruk";
      return "Høyt forbruk";
    }
    if (val < 6) return "Lavt forbruk";
    if (val <= 9) return "Middels forbruk";
    return "Høyt forbruk";
  };

  const consumptionValue = isElectric ? electricConsumption : fuelConsumption;
  const consumptionUnit = isElectric ? "kWh/100km" : "l/100km";
  const consumptionDisplay = consumptionValue != null
    ? `${consumptionValue.toLocaleString("nb-NO", { minimumFractionDigits: isElectric ? 0 : 1, maximumFractionDigits: 1 })} ${consumptionUnit}`
    : "—";

  const rkkValue = rekkevidde ? (rekkevidde.match(/(\d[\d\s]*)/)?.[1]?.trim() || null) : null;

  const baseCards = [
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
      sublabel: getOwnerSublabel(owners),
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
  ];

  if (isElectric) {
    // Electric: 5 cards — add Rekkevidde + Forbruk
    baseCards.push({
      icon: Zap,
      label: "Rekkevidde (WLTP)",
      sublabel: null,
      value: rkkValue ? `${rkkValue} km` : "—",
      color: "text-foreground",
    });
    baseCards.push({
      icon: BatteryCharging,
      label: "Forbruk",
      sublabel: getFuelSublabel(consumptionValue),
      value: consumptionDisplay,
      color: getFuelColor(consumptionValue) || "text-foreground",
    });
  } else {
    // Petrol/diesel: 4 cards — add Forbruk
    baseCards.push({
      icon: Fuel,
      label: "Forbruk",
      sublabel: getFuelSublabel(consumptionValue),
      value: consumptionDisplay,
      color: getFuelColor(consumptionValue) || "text-foreground",
    });
  }

  const gridCols = isElectric ? "grid-cols-2 lg:grid-cols-5" : "grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {baseCards.map((card, i) => (
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
