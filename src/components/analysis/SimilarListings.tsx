import { ExternalLink, BarChart3 } from "lucide-react";

interface SimilarListing {
  title: string;
  price: number;
  year: string;
  mileage: string;
  finnCode: string;
  url: string;
}

interface SimilarListingsProps {
  listings: SimilarListing[];
  currentPrice: number;
  isLoading?: boolean;
}

const SimilarListings = ({ listings, currentPrice, isLoading }: SimilarListingsProps) => {
  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border card-shadow p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="w-4 h-4 animate-pulse" />
          <span>Søker etter lignende biler på Finn.no...</span>
        </div>
      </div>
    );
  }

  if (!listings || listings.length === 0) return null;

  const visibleListings = listings.slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl text-foreground">Lignende annonser</h2>
        <p className="text-sm text-muted-foreground">{listings.length} lignende biler på Finn.no</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleListings.map((listing) => {
          const diff = listing.price - currentPrice;
          const diffPercent = Math.round((diff / currentPrice) * 100);

          return (
            <a
              key={listing.finnCode}
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card rounded-xl border border-border p-4 hover:border-primary/30 hover:bg-accent/30 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {listing.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {[listing.year, listing.mileage].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
              </div>

              <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-border/50">
                <p className="text-sm font-semibold text-foreground">
                  {listing.price.toLocaleString("nb-NO")} kr
                </p>
                {diff !== 0 && (
                  <p className={`text-xs font-medium ${diff < 0 ? "text-green-500" : "text-red-500"}`}>
                    {diff > 0 ? "+" : ""}{diffPercent}%
                  </p>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarListings;
