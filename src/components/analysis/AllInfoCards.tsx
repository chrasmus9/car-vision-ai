import { Weight, Users, Gauge, Zap, Car, Globe, FileWarning, Shield, CheckCircle, AlertTriangle, XCircle, ExternalLink } from "lucide-react";

interface AllInfoCardsProps {
  towWeight?: number | null;
  owners?: number | null;
  maxSpeed?: number | null;
  rekkevidde?: string | null;
  isElectric: boolean;
  power?: string | null;
  // Status cards
  lastEuKontroll: string | null;
  nextEuKontrollDeadline: string | null;
  mileage: string;
  year: number;
  registrertForstegangNorgeDato: string | null;
  bruktimportert?: boolean | string | null;
  regNr: string;
}

const AllInfoCards = (props: AllInfoCardsProps) => {
  const {
    towWeight, owners, maxSpeed, rekkevidde,
    isElectric, power,
    lastEuKontroll, nextEuKontrollDeadline,
    mileage, year, registrertForstegangNorgeDato, bruktimportert, regNr,
  } = props;

  // --- Rekkevidde ---
  const rkkMatches = rekkevidde ? [...rekkevidde.matchAll(/(\d+)\s*km/gi)] : [];
  const rkkValue = rkkMatches.length > 0 ? rkkMatches[rkkMatches.length - 1][1] : null;

  // --- Power ---
  const powerMatch = power?.match(/([\d\s]+)\s*hk/i);
  const powerValue = powerMatch ? powerMatch[1].replace(/\s/g, '') : null;

  // --- EU-kontroll ---
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

  // --- Import ---
  const getImportStatus = () => {
    if (bruktimportert === null || bruktimportert === undefined) {
      return { color: "text-muted-foreground", label: "—" };
    }
    const isImported = bruktimportert === true || bruktimportert === "Ja";
    if (isImported) {
      return { color: "text-red-600 dark:text-red-400", label: "Ja" };
    }
    return { color: "text-green-600 dark:text-green-400", label: "Nei" };
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
      {/* Row 1: Key metrics */}
      {towWeight != null && towWeight > 0 && (
        <InfoCard icon={Weight} label="Maks tilhengervekt" value={`${towWeight.toLocaleString("nb-NO")} kg`} />
      )}
      {owners != null && (
        <InfoCard
          icon={Users}
          label="Antall eiere"
          value={`${owners} ${owners === 1 ? "eier" : "eiere"}`}
          valueColor={owners <= 1 ? "text-green-600 dark:text-green-400" : owners <= 3 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}
        />
      )}
      {maxSpeed != null && (
        <InfoCard icon={Gauge} label="Maks hastighet" value={`${Array.isArray(maxSpeed) ? maxSpeed[0] : maxSpeed} km/t`} />
      )}
      <InfoCard icon={Zap} label="Rekkevidde (WLTP)" value={rkkValue ? `${rkkValue} km` : "—"} />
      {powerValue && (
        <InfoCard icon={Gauge} label="Hestekrefter" value={`${powerValue} hk`} />
      )}

      {/* Row 2: Status cards — same unified layout */}
      <InfoCard
        icon={EuIcon}
        label="EU-kontroll"
        value={euStatus.label}
        valueColor={euStatus.color}
        sublabel={`Frist: ${formatDate(nextEuKontrollDeadline)}${lastEuKontroll ? ` · Sist: ${formatDate(lastEuKontroll)}` : ""}`}
      />

      {kmNum > 0 ? (
        <InfoCard
          icon={Car}
          label="Km vs. alder"
          value={`${kmPerYear.toLocaleString("nb-NO")} km/år · ${kmStatus.label}`}
          valueColor={kmStatus.color}
          sublabel={`${kmNum.toLocaleString("nb-NO")} km over ${years} år`}
        />
      ) : (
        <InfoCard icon={Car} label="Km vs. alder" value="—" />
      )}

      <InfoCard
        icon={Globe}
        label="Bruktimportert"
        value={importStatus.label}
        valueColor={importStatus.color}
      />

      <div className="bg-card rounded-xl border border-border card-shadow p-4 flex items-center gap-3 min-w-[180px] flex-1 basis-[180px] h-24">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <FileWarning className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground leading-tight">Økonomiske heftelser</p>
          <a
            href={heftelserUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Sjekk heftelser <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({
  icon: Icon,
  label,
  sublabel,
  value,
  valueColor,
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  value: string;
  valueColor?: string;
}) => (
  <div className="bg-card rounded-xl border border-border card-shadow p-4 flex items-center gap-3 min-w-[180px] flex-1 basis-[180px] h-24">
    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
      <p className={`text-sm font-semibold ${valueColor || "text-foreground"}`}>{value}</p>
      {sublabel && <p className="text-[10px] text-muted-foreground leading-snug">{sublabel}</p>}
    </div>
  </div>
);

export default AllInfoCards;
