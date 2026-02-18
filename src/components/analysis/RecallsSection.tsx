import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Recall {
  title: string;
  status?: string;
  date: string;
  description: string;
  severity: "high" | "medium" | "low";
  advice: string;
}

interface RecallsSectionProps {
  recalls: Recall[];
}

const severityConfig = {
  high: { label: "Alvorlig", color: "text-red-500" },
  medium: { label: "Moderat", color: "text-amber-500" },
  low: { label: "Mindre", color: "text-emerald-500" },
};

const severityIcon = {
  high: "🔴",
  medium: "🟡",
  low: "🟢",
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
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>Basert på AI-analyse. Verifiser alltid hos <a href="https://www.vegvesen.no" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Statens vegvesen</a> for offisielle tilbakekallinger.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h2 className="text-xl text-foreground">Tilbakekallinger</h2>
          <Badge variant="outline" className="gap-1.5 text-xs">
            <AlertTriangle className="w-3 h-3" />
            {recalls.length} funnet
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Kjente tilbakekallinger for denne modellen</p>
      </div>

      <div className="space-y-4">
        {recalls.map((recall, i) => {
          const severity = severityConfig[recall.severity] || severityConfig.medium;

          return (
            <div key={i} className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-4">
              <div className="flex items-start gap-3">
                
                <div>
                  <h3 className="text-base font-semibold text-foreground">{recall.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{recall.date} · <span className={severity.color}>{severity.label}</span></p>
                </div>
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

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <p>Basert på AI-analyse og kan inneholde unøyaktigheter. Verifiser alltid hos <a href="https://www.vegvesen.no" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Statens vegvesen</a> for offisielle tilbakekallinger.</p>
      </div>
    </div>
  );
};

export default RecallsSection;
