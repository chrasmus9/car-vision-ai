import { Car, Globe, FileWarning, Shield, CheckCircle, AlertTriangle, XCircle, ExternalLink } from "lucide-react";
import EuKontrollSection from "./EuKontrollSection";

interface StatusCardsRowProps {
  // EU-kontroll
  lastEuKontroll: string | null;
  nextEuKontrollDeadline: string | null;
  // Km vs age
  mileage: string;
  year: number;
  firstRegYear: string | null;
  // Import check
  firstRegNorwayDate: string | null;
  modelYear: number;
  // Heftelser
  regNr: string;
}

const StatusCardsRow = ({
  lastEuKontroll,
  nextEuKontrollDeadline,
  mileage,
  year,
  firstRegYear,
  firstRegNorwayDate,
  modelYear,
  regNr,
}: StatusCardsRowProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* EU-kontroll */}
      <EuKontrollCard lastDate={lastEuKontroll} nextDeadline={nextEuKontrollDeadline} />

      {/* Kilometerstand vs. alder */}
      <KmPerYearCard mileage={mileage} year={year} firstRegYear={firstRegYear} />

      {/* Bruktimportert */}
      <ImportCard firstRegNorwayDate={firstRegNorwayDate} modelYear={modelYear} />

      {/* Økonomiske heftelser */}
      <HeftelserCard regNr={regNr} />
    </div>
  );
};

// --- EU-kontroll mini card ---
const EuKontrollCard = ({ lastDate, nextDeadline }: { lastDate: string | null; nextDeadline: string | null }) => {
  const getStatus = () => {
    if (!nextDeadline) return { color: "text-muted-foreground", bg: "bg-muted/30", label: "Ukjent", icon: Shield };
    const now = new Date();
    const deadline = new Date(nextDeadline);
    const diffMs = deadline.getTime() - now.getTime();
    const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);

    if (diffMonths > 6) return { color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30", label: "Gyldig", icon: CheckCircle };
    if (diffMonths > 3) return { color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/30", label: "Utløper snart", icon: AlertTriangle };
    if (diffMonths > 0) return { color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", label: "Utløper straks", icon: XCircle };
    return { color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", label: "Utløpt", icon: XCircle };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  const formatDate = (d: string | null) => {
    if (!d) return "Ukjent";
    try {
      return new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border card-shadow p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">EU-kontroll</p>
        <StatusIcon className={`w-4 h-4 ${status.color}`} />
      </div>
      <p className={`text-sm font-semibold ${status.color}`}>{status.label}</p>
      <p className="text-[10px] text-muted-foreground leading-snug">
        Frist: {formatDate(nextDeadline)}
        {lastDate && <> · Sist: {formatDate(lastDate)}</>}
      </p>
    </div>
  );
};

// --- Km per year card ---
const KmPerYearCard = ({ mileage, year, firstRegYear }: { mileage: string; year: number; firstRegYear: string | null }) => {
  const kmNum = parseInt(mileage?.replace(/\D/g, "") || "0");
  const regYear = firstRegYear ? parseInt(firstRegYear.substring(0, 4)) : year;
  const currentYear = new Date().getFullYear();
  const years = Math.max(1, currentYear - regYear);
  const kmPerYear = Math.round(kmNum / years);

  const getStatus = () => {
    if (kmNum === 0) return { color: "text-muted-foreground", label: "—" };
    if (kmPerYear <= 17000) return { color: "text-green-600 dark:text-green-400", label: "Normal" };
    if (kmPerYear <= 22000) return { color: "text-yellow-600 dark:text-yellow-400", label: "Litt høy" };
    return { color: "text-red-600 dark:text-red-400", label: "Høy" };
  };

  const status = getStatus();

  return (
    <div className="bg-card rounded-xl border border-border card-shadow p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Km vs. alder</p>
        <Car className="w-4 h-4 text-muted-foreground" />
      </div>
      {kmNum > 0 ? (
        <>
          <p className={`text-sm font-semibold ${status.color}`}>
            {kmPerYear.toLocaleString("nb-NO")} km/år · {status.label}
          </p>
          <p className="text-[10px] text-muted-foreground leading-snug">
            {kmNum.toLocaleString("nb-NO")} km over {years} år · Snitt: ~15 000 km/år
          </p>
        </>
      ) : (
        <p className="text-sm font-semibold text-muted-foreground">—</p>
      )}
    </div>
  );
};

// --- Import card ---
const ImportCard = ({ firstRegNorwayDate, modelYear }: { firstRegNorwayDate: string | null; modelYear: number }) => {
  const norwayYear = firstRegNorwayDate ? parseInt(firstRegNorwayDate.substring(0, 4)) : null;
  const diff = norwayYear && modelYear ? norwayYear - modelYear : null;

  const getStatus = () => {
    if (diff == null || !norwayYear || !modelYear) return { color: "text-muted-foreground", label: "Ukjent", imported: null };
    if (diff >= 2) return { color: "text-red-600 dark:text-red-400", label: "Ja", imported: true };
    return { color: "text-green-600 dark:text-green-400", label: "Nei", imported: false };
  };

  const status = getStatus();

  return (
    <div className="bg-card rounded-xl border border-border card-shadow p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Bruktimportert</p>
        <Globe className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className={`text-sm font-semibold ${status.color}`}>{status.label}</p>
      {norwayYear && modelYear ? (
        <p className="text-[10px] text-muted-foreground leading-snug">
          Første reg. i Norge: {norwayYear} · Årsmodell: {modelYear}
        </p>
      ) : (
        <p className="text-[10px] text-muted-foreground">Mangler data</p>
      )}
    </div>
  );
};

// --- Heftelser card ---
const HeftelserCard = ({ regNr }: { regNr: string }) => {
  const url = regNr
    ? `https://www.brreg.no/heftelser/?regnr=${encodeURIComponent(regNr)}`
    : "https://www.brreg.no/heftelser";

  return (
    <div className="bg-card rounded-xl border border-border card-shadow p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Økonomiske heftelser</p>
        <FileWarning className="w-4 h-4 text-muted-foreground" />
      </div>
      <a
        href={url}
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
  );
};

export default StatusCardsRow;
