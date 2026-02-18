import { ExternalLink, TrendingDown, TrendingUp, Minus, BarChart3 } from "lucide-react";
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
    if (priceDiffPercent < -10) return { icon: TrendingDown, label: "Under markedspris", color: "text-green-500" };
    if (priceDiffPercent > 10) return { icon: TrendingUp, label: "Over markedspris", color: "text-red-500" };
    return { icon: Minus, label: "Rundt markedspris", color: "text-yellow-500" };
  };

  const indicator = getPriceIndicator();

  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Prisanalyse
        </h2>
        {indicator && (
          <Badge variant="outline" className={`gap-1.5 ${indicator.color}`}>
            <indicator.icon className="w-3.5 h-3.5" />
            {indicator.label}
          </Badge>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-foreground">{price.toLocaleString("nb-NO")} kr</p>
        <p className="text-xs text-muted-foreground">Annonsepris</p>
      </div>

      {/* Market comparison stats */}
      {priceStats && (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{priceStats.min.toLocaleString("nb-NO")} kr</p>
            <p className="text-xs text-muted-foreground">Laveste</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-primary">{priceStats.avg.toLocaleString("nb-NO")} kr</p>
            <p className="text-xs text-muted-foreground">Gjennomsnitt</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{priceStats.max.toLocaleString("nb-NO")} kr</p>
            <p className="text-xs text-muted-foreground">Høyeste</p>
          </div>
        </div>
      )}

      {priceDiffFromAvg !== null && priceStats && (
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-foreground/80">
            Denne bilen er{" "}
            <span className={`font-semibold ${priceDiffFromAvg < 0 ? "text-green-500" : priceDiffFromAvg > 0 ? "text-red-500" : "text-yellow-500"}`}>
              {Math.abs(priceDiffFromAvg).toLocaleString("nb-NO")} kr {priceDiffFromAvg < 0 ? "under" : priceDiffFromAvg > 0 ? "over" : "lik"}
            </span>{" "}
            gjennomsnittet ({priceDiffPercent! > 0 ? "+" : ""}{priceDiffPercent}%) basert på {priceStats.count} lignende annonser på Finn.no.
          </p>
        </div>
      )}

      {assessment && (
        <div className="pt-3 border-t border-border">
          <p className="text-sm text-foreground/80 leading-relaxed">{assessment}</p>
        </div>
      )}

      {/* Similar listings */}
      {isLoadingSimilar && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="w-4 h-4 animate-pulse" />
            <span>Søker etter lignende biler på Finn.no...</span>
          </div>
        </div>
      )}

      {similarListings && similarListings.length > 0 && (
        <div className="pt-3 border-t border-border space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Lignende annonser på Finn.no</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {similarListings.slice(0, 6).map((listing) => {
              const diff = listing.price - price;
              return (
                <a
                  key={listing.finnCode}
                  href={listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[listing.year, listing.mileage].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{listing.price.toLocaleString("nb-NO")} kr</p>
                      {diff !== 0 && (
                        <p className={`text-xs ${diff < 0 ? "text-green-500" : "text-red-500"}`}>
                          {diff > 0 ? "+" : ""}{diff.toLocaleString("nb-NO")} kr
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceAnalysis;
