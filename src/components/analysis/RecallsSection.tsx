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

export interface NHTSARecall {
  nhtsaCampaignNumber: string;
  title: string;
  description: string;
  remedy: string;
  date: string;
  severity: "high" | "medium" | "low";
  component: string;
  manufacturer: string;
  overTheAirUpdate: boolean;
  source: "nhtsa";
}

interface RecallsSectionProps {
  recalls: Recall[];
  nhtsaRecalls?: NHTSARecall[];
  nhtsaCode?: string;
  svvCode?: string;
}

const severityConfig = {
  high: { label: "Alvorlig", color: "text-red-500" },
  medium: { label: "Moderat", color: "text-amber-500" },
  low: { label: "Mindre", color: "text-emerald-500" },
};

const isDev = import.meta.env.DEV;

const RecallsSection = ({ recalls, nhtsaRecalls = [], nhtsaCode, svvCode }: RecallsSectionProps) => {
  // Deduplicate: if NHTSA and AI describe the same recall, prefer NHTSA
  const nhtsaTitlesLower = new Set(nhtsaRecalls.map(r => r.title.toLowerCase().substring(0, 40)));
  const nhtsaDescsLower = new Set(nhtsaRecalls.map(r => r.description.toLowerCase().substring(0, 60)));
  
  const filteredAiRecalls = recalls.filter(r => {
    const titleLower = r.title.toLowerCase().substring(0, 40);
    const descLower = r.description.toLowerCase().substring(0, 60);
    return !nhtsaTitlesLower.has(titleLower) && !nhtsaDescsLower.has(descLower);
  });

  const totalCount = nhtsaRecalls.length + filteredAiRecalls.length;

  if (totalCount === 0) {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl text-foreground">Tilbakekallinger</h2>
            {isDev && nhtsaCode && (
              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">{nhtsaCode}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Kjente tilbakekallinger for denne modellen</p>
        </div>
        <div className="bg-card rounded-2xl border border-border card-shadow p-6 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm text-foreground/80">Ingen kjente tilbakekallinger funnet for denne modellen og årsmodellen.</p>
        </div>
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>Basert på NHTSA og AI-analyse. Verifiser alltid hos <a href="https://www.vegvesen.no" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Statens vegvesen</a> for offisielle tilbakekallinger.</p>
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
            {totalCount} funnet
          </Badge>
          {isDev && nhtsaCode && (
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">{nhtsaCode}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Kjente tilbakekallinger for denne modellen</p>
      </div>

      <div className="space-y-4">
        {/* NHTSA recalls first */}
        {nhtsaRecalls.map((recall, i) => {
          const severity = severityConfig[recall.severity] || severityConfig.medium;
          return (
            <div key={`nhtsa-${i}`} className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">🔵 Offisiell</span>
                  {recall.overTheAirUpdate && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">📡 OTA</span>
                  )}
                  <span className={`text-xs ${severity.color}`}>{severity.label}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground">{recall.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{recall.date}{recall.component && ` · ${recall.component}`}</p>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{recall.description}</p>
              {recall.remedy && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-2 border border-border/50">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Anbefaling</p>
                  <p className="text-sm font-medium text-foreground leading-relaxed">{recall.remedy}</p>
                </div>
              )}
            </div>
          );
        })}

        {/* AI recalls */}
        {filteredAiRecalls.map((recall, i) => {
          const severity = severityConfig[recall.severity] || severityConfig.medium;
          return (
            <div key={`ai-${i}`} className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">🤖 AI-analyse</span>
                  <span className={`text-xs ${severity.color}`}>{severity.label}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground">{recall.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{recall.date}</p>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{recall.description}</p>
              {recall.advice && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-2 border border-border/50">
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
        <p>NHTSA-data er offisielle amerikanske tilbakekallinger og kan avvike fra norske. AI-analyse kan inneholde unøyaktigheter. Verifiser alltid hos <a href="https://www.vegvesen.no" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Statens vegvesen</a>.</p>
      </div>
    </div>
  );
};

export default RecallsSection;
