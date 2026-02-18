import { AlertTriangle, AlertCircle, CheckCircle, ChevronRight, MessageSquare, Wrench, Zap, Shield, DollarSign, Settings, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Risk {
  level: "high" | "medium" | "low";
  title: string;
  category: string;
  description: string;
  question: string;
}

interface RiskAssessmentProps {
  risks: Risk[];
  highlights?: string[];
}

const levelConfig = {
  high: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500", dotBg: "bg-red-500", label: "Høy risiko" },
  medium: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500", dotBg: "bg-amber-500", label: "Middels risiko" },
  low: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500", dotBg: "bg-emerald-500", label: "Lav risiko" },
};

const categoryIcons: Record<string, typeof Wrench> = {
  Motor: Settings,
  Drivverk: Settings,
  Karosseri: Car,
  Elektronikk: Zap,
  Økonomi: DollarSign,
  Vedlikehold: Wrench,
  Sikkerhet: Shield,
};

const getHighlightEmoji = (text: string): string => {
  const t = text.toLowerCase();
  if (t.includes("pris") || t.includes("gunstig") || t.includes("inngang") || t.includes("finans") || t.includes("rente")) return "💰";
  if (t.includes("garanti") || t.includes("reklamasjon")) return "🛡️";
  if (t.includes("service") || t.includes("vedlikehold")) return "🔧";
  if (t.includes("forhandler") || t.includes("merke") || t.includes("selger") || t.includes("bytterett")) return "🏪";
  if (t.includes("eu") || t.includes("kontroll")) return "✅";
  if (t.includes("batteri") || t.includes("elektrisk") || t.includes("rekkevidde") || t.includes("ladehastighet")) return "🔋";
  if (t.includes("utstyr") || t.includes("utstyrt") || t.includes("lyd") || t.includes("seter")) return "✨";
  if (t.includes("firehjul") || t.includes("awd") || t.includes("4wd") || t.includes("drift")) return "🏔️";
  if (t.includes("tilhenger") || t.includes("hengerfeste")) return "🪝";
  if (t.includes("vinter") || t.includes("dekk")) return "❄️";
  if (t.includes("lakk") || t.includes("coating") || t.includes("karosseri")) return "🎨";
  if (t.includes("km") || t.includes("kjørelengde") || t.includes("kilometerstand")) return "🛣️";
  if (t.includes("eier") || t.includes("velholdt")) return "👤";
  if (t.includes("plass") || t.includes("bagasje") || t.includes("romslig")) return "📦";
  if (t.includes("sikkerhet") || t.includes("kollisjon") || t.includes("brems")) return "🛑";
  return "⭐";
};

const RiskAssessment = ({ risks, highlights }: RiskAssessmentProps) => {
  const highCount = risks.filter(r => r.level === "high").length;
  const medCount = risks.filter(r => r.level === "medium").length;
  const lowCount = risks.filter(r => r.level === "low").length;

  return (
    <div className="space-y-8">
      {/* Risk badges */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Risikoer</h3>
        <div className="flex flex-wrap gap-2">
          {risks.map((risk, i) => {
            const cfg = levelConfig[risk.level];
            return (
              <a key={i} href={`#risk-${i}`} className="group">
                <Badge
                  variant="outline"
                  className="gap-2 px-3 py-1.5 cursor-pointer hover:bg-accent transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dotBg}`} />
                  {risk.title}
                  <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Badge>
              </a>
            );
          })}
        </div>
      </div>

      {/* Highlights badges */}
      {highlights && highlights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Høydepunkter</h3>
          <div className="flex flex-wrap gap-2">
            {highlights.map((h, i) => (
              <Badge key={i} variant="outline" className="gap-2 px-3 py-1.5">
                <span className="text-sm">{getHighlightEmoji(h)}</span>
                {h}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Risk summary bar */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Risikofordeling</h3>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
          {highCount > 0 && (
            <div className="bg-red-500 transition-all" style={{ width: `${(highCount / risks.length) * 100}%` }} />
          )}
          {medCount > 0 && (
            <div className="bg-amber-500 transition-all" style={{ width: `${(medCount / risks.length) * 100}%` }} />
          )}
          {lowCount > 0 && (
            <div className="bg-emerald-500 transition-all" style={{ width: `${(lowCount / risks.length) * 100}%` }} />
          )}
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          {highCount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Høy: {highCount}
            </span>
          )}
          {medCount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Middels: {medCount}
            </span>
          )}
          {lowCount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Lav: {lowCount}
            </span>
          )}
        </div>
      </div>

      {/* Detailed risk section */}
      <div className="space-y-3">
        <h2 className="text-xl text-foreground">Risikovurdering</h2>
        <p className="text-sm text-muted-foreground">Basert på AI-analyse av bilannonsen</p>
      </div>

      <div className="space-y-6">
        {risks.map((risk, i) => {
          const cfg = levelConfig[risk.level];
          const CategoryIcon = categoryIcons[risk.category] || Wrench;

          return (
            <div key={i} id={`risk-${i}`} className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className={`text-lg font-bold ${cfg.color}`}>{i + 1}.</span>
                  <h3 className="text-base font-semibold text-foreground">{risk.title}</h3>
                </div>
                <Badge variant="outline" className="gap-1.5 shrink-0 text-xs">
                  <CategoryIcon className="w-3 h-3" />
                  {risk.category}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-foreground/80 leading-relaxed pl-7">{risk.description}</p>

              {/* Question for seller */}
              {risk.question && (
                <div className="ml-7 bg-muted/50 rounded-xl p-4 space-y-2.5 border border-border/50">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Spør selger</p>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    "{risk.question}"
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskAssessment;
