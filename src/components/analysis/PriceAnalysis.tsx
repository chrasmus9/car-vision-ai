import { ExternalLink, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SimilarListing {
  title: string;
  price: number;
  year: string;
  mileage: string;
  finnCode: string;
  url: string;
}

interface PriceStats {
  count: number;
  min: number;
  max: number;
  avg: number;
  median: number;
}

interface PriceAnalysisProps {
  price: number;
  assessment?: string;
  similarListings?: SimilarListing[];
  priceStats?: PriceStats | null;
  isLoadingSimilar?: boolean;
}

const PriceAnalysis = ({ price, assessment, similarListings, priceStats, isLoadingSimilar }: PriceAnalysisProps) => {
  const priceDiffFromAvg = priceStats ? price - priceStats.avg : null;
  const priceDiffPercent = priceStats ? Math.round((priceDiffFromAvg! / priceStats.avg) * 100) : null;

  const getPriceIndicator = () => {
    if (!priceDiffPercent) return null;
    if (priceDiffPercent < -5) return { icon: TrendingDown, label: `${priceDiffPercent}%`, color: "text-green-500" };
    if (priceDiffPercent > 5) return { icon: TrendingUp, label: `+${priceDiffPercent}%`, color: "text-red-500" };
    return { icon: Minus, label: `~${Math.abs(priceDiffPercent)}%`, color: "text-yellow-500" };
  };

  const indicator = getPriceIndicator();

  return (
    <div className="bg-card rounded-xl border border-border card-shadow p-4 space-y-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Prisanalyse</h2>
        {indicator && (
          <Badge variant="outline" className={`gap-1 text-xs ${indicator.color}`}>
            <indicator.icon className="w-3 h-3" />
            {indicator.label}
          </Badge>
        )}
      </div>

      <div>
        <p className="text-xl font-bold text-foreground">{price.toLocaleString("nb-NO")} kr</p>
        <p className="text-xs text-muted-foreground">Annonsepris</p>
      </div>

      {priceStats && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
          <div className="text-center">
            <p className="text-xs font-semibold text-foreground">{priceStats.min.toLocaleString("nb-NO")} kr</p>
            <p className="text-[10px] text-muted-foreground">Laveste</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-primary">{priceStats.avg.toLocaleString("nb-NO")} kr</p>
            <p className="text-[10px] text-muted-foreground">Gjennomsnitt</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-foreground">{priceStats.max.toLocaleString("nb-NO")} kr</p>
            <p className="text-[10px] text-muted-foreground">Høyeste</p>
          </div>
        </div>
      )}

      {priceDiffFromAvg !== null && priceStats && (
        <div className="bg-muted/50 rounded-lg p-2.5">
          <p className="text-xs text-foreground/80">
            Denne bilen er{" "}
            <span className={`font-semibold ${priceDiffFromAvg < 0 ? "text-green-500" : priceDiffFromAvg > 0 ? "text-red-500" : "text-yellow-500"}`}>
              {Math.abs(priceDiffFromAvg).toLocaleString("nb-NO")} kr {priceDiffFromAvg < 0 ? "under" : priceDiffFromAvg > 0 ? "over" : "lik"}
            </span>{" "}
            gjennomsnittet ({priceDiffPercent! > 0 ? "+" : ""}{priceDiffPercent}%) basert på {priceStats.count} lignende annonser.
          </p>
        </div>
      )}

      {assessment && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-foreground/80 leading-relaxed">{assessment}</p>
        </div>
      )}
    </div>
  );
};

export default PriceAnalysis;
