import { Weight, Users, Gauge, Fuel, Zap, BatteryCharging, Car, Globe, FileWarning, Shield, CheckCircle, AlertTriangle, XCircle, ExternalLink } from "lucide-react";

interface AllInfoCardsProps {
  // Key metrics
  towWeight?: number | null;
  owners?: number | null;
  maxSpeed?: number | null;
  fuelConsumption?: number | null;
  rekkevidde?: string | null;
  isElectric: boolean;
  electricConsumption?: number | null;
  fuelType?: string;
  batteryCapacityKwh?: number | null;
  // Status cards
  lastEuKontroll: string | null;
  nextEuKontrollDeadline: string | null;
  mileage: string;
  year: number;
  forstegangsGodkjenningDato: string | null;
  registrertForstegangNorgeDato: string | null;
  regNr: string;
}

const AllInfoCards = (props: AllInfoCardsProps) => {
  const {
    towWeight, owners, maxSpeed, fuelConsumption, rekkevidde,
    isElectric, electricConsumption, fuelType, batteryCapacityKwh,
    lastEuKontroll, nextEuKontrollDeadline,
    mileage, year, forstegangsGodkjenningDato, registrertForstegangNorgeDato, regNr,
  } = props;

  const isDiesel = fuelType?.toLowerCase()?.includes("diesel") || false;

  // --- Owner helpers ---
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

  // --- Fuel helpers ---
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

  // EV consumption: use API value, or calculate from battery/range
  let consumptionValue = isElectric ? electricConsumption : fuelConsumption;
  let consumptionCalculated = false;
  if (isElectric && consumptionValue == null && batteryCapacityKwh && rekkevidde) {
    const matches = [...rekkevidde.matchAll(/(\d+)\s*km/gi)];
    const wltpRangeKm = matches.length > 0 ? parseInt(matches[matches.length - 1][1]) : null;
    if (wltpRangeKm && wltpRangeKm > 0) {
      consumptionValue = Math.round((batteryCapacityKwh / wltpRangeKm) * 100 * 10) / 10;
      consumptionCalculated = true;
    }
  }
  const consumptionUnit = isElectric ? "kWh/100km" : "l/100km";
  const consumptionDisplay = consumptionValue != null
    ? `${consumptionValue.toLocaleString("nb-NO", { minimumFractionDigits: isElectric ? 0 : 1, maximumFractionDigits: 1 })} ${consumptionUnit}`
    : "—";

  const rkkMatches = rekkevidde ? [...rekkevidde.matchAll(/(\d+)\s*km/gi)] : [];
  const rkkValue = rkkMatches.length > 0 ? rkkMatches[rkkMatches.length - 1][1] : null;

  // --- EU-kontroll helpers ---
  const getEuStatus = () => {
    if (!nextEuKontrollDeadline) return { color: "text-muted-foreground", label: "Ukjent", icon: Shield };
    const now = new Date();
    const deadline = new Date(nextEuKontrollDeadline);
    const diffMonths = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    if (diffMonths > 6) return { color: "text-green-600 dark:text-green-400", label: "Gyldig", icon: CheckCircle };
    if (diffMonths > 3) return { color: "text-yellow-600 dark:text-yellow-400", label: "Utløper snart", icon: AlertTriangle };
    if (diffMonths > 0) return { color: "text-red-600 dark:text-red-400", label: "Utløper straks", icon: XCircle };
    return { color: "text-red-600 dark:text-red-400", label: "Utløpt", icon: XCircle };
  };

  const formatDate = (d: string | null) => {
    if (!d) return "Ukjent";
    try { return new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  // --- Km vs age ---
  const kmNum = parseInt(mileage?.replace(/\D/g, "") || "0");
  const regYear = registrertForstegangNorgeDato ? parseInt(registrertForstegangNorgeDato.substring(0, 4)) : year;
  const currentYear = new Date().getFullYear();
  const years = Math.max(1, currentYear - regYear);
  const kmPerYear = Math.round(kmNum / years);
  const getKmStatus = () => {
    if (kmNum === 0) return { color: "text-muted-foreground", label: "—" };
    if (kmPerYear <= 17000) return { color: "text-green-600 dark:text-green-400", label: "Normal" };
    if (kmPerYear <= 22000) return { color: "text-yellow-600 dark:text-yellow-400", label: "Litt høy" };
    return { color: "text-red-600 dark:text-red-400", label: "Høy" };
  };

  // --- Import (Vegvesen-only) ---
  const getImportStatus = () => {
    if (!forstegangsGodkjenningDato || !registrertForstegangNorgeDato) {
      return { color: "text-muted-foreground", label: "—", detail: null };
    }
    const approvalDate = new Date(forstegangsGodkjenningDato);
    const norwayDate = new Date(registrertForstegangNorgeDato);
    const diffMonths = (norwayDate.getTime() - approvalDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    const approvalYear = approvalDate.getFullYear();
    const norwayYear = norwayDate.getFullYear();
    if (diffMonths >= 12) {
      return {
        color: "text-red-600 dark:text-red-400",
        label: "Ja",
        detail: `Første godkjenning: ${approvalYear} · Reg. i Norge: ${norwayYear}`,
      };
    }
    return { color: "text-green-600 dark:text-green-400", label: "Nei", detail: null };
  };

  const euStatus = getEuStatus();
  const EuIcon = euStatus.icon;
  const kmStatus = getKmStatus();
  const importStatus = getImportStatus();

  const heftelserUrl = regNr
    ? `https://rettsstiftelser.brreg.no/nb/oppslag/motorvogn/${encodeURIComponent(regNr)}`
    : "https://rettsstiftelser.brreg.no/nb/oppslag/motorvogn";

  return (
    <div className="flex flex-wrap gap-3">
      {/* Key metrics cards */}
      <InfoCard
        icon={Weight}
        label="Maks tilhengervekt"
        sublabel="m/bremser"
        value={towWeight ? `${towWeight.toLocaleString("nb-NO")} kg` : "—"}
      />
      <InfoCard
        icon={Users}
        label="Antall eiere"
        sublabel={getOwnerSublabel(owners)}
        value={owners != null ? `${owners} ${owners === 1 ? "eier" : "eiere"}` : "—"}
        valueColor={getOwnerColor(owners)}
      />
      <InfoCard
        icon={Gauge}
        label="Maks hastighet"
        value={maxSpeed ? `${Array.isArray(maxSpeed) ? maxSpeed[0] : maxSpeed} km/t` : "—"}
      />
      {isElectric && (
        <InfoCard
          icon={Zap}
          label="Rekkevidde (WLTP)"
          value={rkkValue ? `${rkkValue} km` : "—"}
        />
      )}
      <InfoCard
        icon={isElectric ? BatteryCharging : Fuel}
        label="Forbruk"
        sublabel={consumptionCalculated ? "(beregnet)" : getFuelSublabel(consumptionValue)}
        value={consumptionDisplay}
        valueColor={getFuelColor(consumptionValue)}
      />

      {/* Status cards */}
      <div className="bg-card rounded-xl border border-border card-shadow p-4 space-y-2 min-w-[180px] flex-1 basis-[180px]">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground leading-tight">EU-kontroll</p>
          <EuIcon className={`w-4 h-4 ${euStatus.color}`} />
        </div>
        <p className={`text-sm font-semibold ${euStatus.color}`}>{euStatus.label}</p>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Frist: {formatDate(nextEuKontrollDeadline)}
          {lastEuKontroll && <> · Sist: {formatDate(lastEuKontroll)}</>}
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border card-shadow p-4 space-y-2 min-w-[180px] flex-1 basis-[180px]">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground leading-tight">Km vs. alder</p>
          <Car className="w-4 h-4 text-muted-foreground" />
        </div>
        {kmNum > 0 ? (
          <>
            <p className={`text-sm font-semibold ${kmStatus.color}`}>
              {kmPerYear.toLocaleString("nb-NO")} km/år · {kmStatus.label}
            </p>
            <p className="text-[10px] text-muted-foreground leading-snug">
              {kmNum.toLocaleString("nb-NO")} km over {years} år
            </p>
          </>
        ) : (
          <p className="text-sm font-semibold text-muted-foreground">—</p>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border card-shadow p-4 space-y-2 min-w-[180px] flex-1 basis-[180px]">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground leading-tight">Bruktimportert</p>
          <Globe className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className={`text-sm font-semibold ${importStatus.color}`}>{importStatus.label}</p>
        {importStatus.detail && (
          <p className="text-[10px] text-muted-foreground leading-snug">{importStatus.detail}</p>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border card-shadow p-4 space-y-2 min-w-[180px] flex-1 basis-[180px]">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground leading-tight">Økonomiske heftelser</p>
          <FileWarning className="w-4 h-4 text-muted-foreground" />
        </div>
        <a
          href={heftelserUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Sjekk heftelser <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Gratis offisiell sjekk via Brønnøysundregistrene
        </p>
      </div>
    </div>
  );
};

// Reusable card for key metrics
const InfoCard = ({
  icon: Icon,
  label,
  sublabel,
  value,
  valueColor,
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string | null;
  value: string;
  valueColor?: string;
}) => (
  <div className="bg-card rounded-xl border border-border card-shadow p-4 flex items-center gap-3 min-w-[180px] flex-1 basis-[180px]">
    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground leading-tight">
        {label}
        {sublabel && <span className="block text-[10px]">{sublabel}</span>}
      </p>
      <p className={`text-sm font-semibold ${valueColor || "text-foreground"}`}>{value}</p>
    </div>
  </div>
);

export default AllInfoCards;
