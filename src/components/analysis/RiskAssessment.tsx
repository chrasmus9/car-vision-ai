import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface Risk {
  level: "high" | "medium" | "low";
  title: string;
  description: string;
}

interface RiskAssessmentProps {
  risks: Risk[];
}

const riskConfig = {
  high: { icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
  medium: { icon: AlertCircle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  low: { icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
};

const RiskAssessment = ({ risks }: RiskAssessmentProps) => {
  const highCount = risks.filter(r => r.level === "high").length;
  const medCount = risks.filter(r => r.level === "medium").length;

  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          Risikovurdering
        </h2>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          {highCount} høy · {medCount} middels
        </span>
      </div>
      <div className="space-y-3">
        {risks.map((risk, i) => {
          const cfg = riskConfig[risk.level];
          const Icon = cfg.icon;
          return (
            <div key={i} className="flex gap-3">
              <div className={`shrink-0 w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${cfg.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{risk.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{risk.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskAssessment;
