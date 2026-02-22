import { Shield, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface EuKontrollProps {
  lastDate: string | null;
  nextDeadline: string | null;
}

const EuKontrollSection = ({ lastDate, nextDeadline }: EuKontrollProps) => {
  if (!lastDate && !nextDeadline) return null;

  const getStatus = () => {
    if (!nextDeadline) return { color: "muted", label: "Ukjent", icon: Shield, months: null };

    const now = new Date();
    const deadline = new Date(nextDeadline);
    const diffMs = deadline.getTime() - now.getTime();
    const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);

    if (diffMonths > 6) return { color: "green", label: "Gyldig", icon: CheckCircle, months: Math.round(diffMonths) };
    if (diffMonths > 3) return { color: "yellow", label: "Utløper snart", icon: AlertTriangle, months: Math.round(diffMonths) };
    if (diffMonths > 0) return { color: "red", label: "Utløper straks", icon: XCircle, months: Math.round(diffMonths) };
    return { color: "red", label: "Utløpt", icon: XCircle, months: 0 };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  const formatDate = (d: string | null) => {
    if (!d) return "Ukjent";
    try {
      return new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return d;
    }
  };

  const statusColors = {
    green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    yellow: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
    red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    muted: "text-muted-foreground bg-muted/30 border-border",
  };

  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">EU-kontroll</h2>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${statusColors[status.color as keyof typeof statusColors]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Sist godkjent</p>
          <p className="text-sm font-medium text-foreground">{formatDate(lastDate)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Neste frist</p>
          <p className="text-sm font-medium text-foreground">{formatDate(nextDeadline)}</p>
        </div>
      </div>

      {status.months !== null && status.months > 0 && (
        <p className="text-xs text-muted-foreground">
          {status.months} {status.months === 1 ? "måned" : "måneder"} til neste frist
        </p>
      )}
    </div>
  );
};

export default EuKontrollSection;
