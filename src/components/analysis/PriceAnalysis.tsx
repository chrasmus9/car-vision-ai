import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface PriceAnalysisProps {
  price: number;
}

const comparisons = [
  { label: "BMW 3-serie 2012, 195 000 km", price: 118982 },
  { label: "BMW 3-serie 2012, 221 500 km", price: 99000 },
  { label: "BMW 3-serie 2012, 325 600 km", price: 80942 },
  { label: "BMW 3-serie 2010, 245 834 km", price: 62942 },
  { label: "BMW 3-serie 2013, 197 000 km", price: 98900 },
];

const PriceAnalysis = ({ price }: PriceAnalysisProps) => {
  const avg = Math.round(comparisons.reduce((sum, c) => sum + c.price, 0) / comparisons.length);
  const diff = price - avg;
  const pct = Math.round((diff / avg) * 100);

  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
        Prisanalyse
      </h2>

      <div className="flex items-center gap-4">
        <div>
          <p className="text-2xl font-bold text-foreground">{price.toLocaleString("nb-NO")} kr</p>
          <p className="text-xs text-muted-foreground">Annonsepris</p>
        </div>
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-1">
            {diff < 0 ? (
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            ) : diff > 0 ? (
              <TrendingUp className="w-4 h-4 text-red-600" />
            ) : (
              <Minus className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={`text-sm font-semibold ${diff < 0 ? "text-emerald-600" : diff > 0 ? "text-red-600" : "text-muted-foreground"}`}>
              {pct > 0 ? "+" : ""}{pct}% vs. snitt
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Snitt: {avg.toLocaleString("nb-NO")} kr</p>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lignende biler på Finn.no</p>
        {comparisons.map((c, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground truncate pr-2">{c.label}</span>
            <span className="font-medium text-foreground shrink-0">{c.price.toLocaleString("nb-NO")} kr</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceAnalysis;
