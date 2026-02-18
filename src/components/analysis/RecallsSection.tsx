import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Recall {
  title: string;
  status: "active" | "expired" | "completed";
  date: string;
  description: string;
  severity: "high" | "medium" | "low";
  advice: string;
}

interface RecallsSectionProps {
  recalls: Recall[];
}

const statusConfig = {
  active: { label: "Aktiv", icon: ShieldAlert, className: "border-red-500/30 text-red-500 bg-red-500/10" },
  expired: { label: "Utløpt", icon: Clock, className: "border-amber-500/30 text-amber-500 bg-amber-500/10" },
  completed: { label: "Utbedret", icon: CheckCircle2, className: "border-emerald-500/30 text-emerald-500 bg-emerald-500/10" },
};

const severityConfig = {
  high: { label: "Alvorlig", color: "text-red-500" },
  medium: { label: "Moderat", color: "text-amber-500" },
  low: { label: "Mindre", color: "text-emerald-500" },
};

const RecallsSection = ({ recalls }: RecallsSectionProps) => {
  if (!recalls || recalls.length === 0) {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-xl text-foreground">Tilbakekallinger</h2>
          <p className="text-sm text-muted-foreground">Kjente tilbakekallinger for denne modellen</p>
        </div>
        <div className="bg-card rounded-2xl border border-border card-shadow p-6 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm text-foreground/80">Ingen kjente tilbakekallinger funnet for denne modellen og årsmodellen.</p>
        </div>
      </div>
    );
  }

  const activeCount = recalls.filter(r => r.status === "active").length;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h2 className="text-xl text-foreground">Tilbakekallinger</h2>
          {activeCount > 0 && (
            <Badge variant="outline" className="gap-1.5 border-red-500/30 text-red-500 bg-red-500/10">
              <AlertTriangle className="w-3 h-3" />
              {activeCount} aktiv{activeCount > 1 ? "e" : ""}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Kjente tilbakekallinger for denne modellen</p>
      </div>

      <div className="space-y-4">
        {recalls.map((recall, i) => {
          const status = statusConfig[recall.status] || statusConfig.completed;
          const severity = severityConfig[recall.severity] || severityConfig.medium;
          const StatusIcon = status.icon;

          return (
            <div key={i} className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <StatusIcon className={`w-5 h-5 shrink-0 mt-0.5 ${recall.status === "active" ? "text-red-500" : recall.status === "expired" ? "text-amber-500" : "text-emerald-500"}`} />
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{recall.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{recall.date} · <span className={severity.color}>{severity.label}</span></p>
                  </div>
                </div>
                <Badge variant="outline" className={`shrink-0 text-xs ${status.className}`}>
                  {status.label}
                </Badge>
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed pl-8">{recall.description}</p>

              {recall.advice && (
                <div className="ml-8 bg-muted/50 rounded-xl p-4 space-y-2 border border-border/50">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Anbefaling</p>
                  <p className="text-sm font-medium text-foreground leading-relaxed">{recall.advice}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecallsSection;
