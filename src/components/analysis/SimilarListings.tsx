import { useState } from "react";
import { ExternalLink, BarChart3, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SimilarListing {
  title: string;
  price: number;
  year: string;
  mileage: string;
  sellerType: string;
  finnCode: string;
  url: string;
}

interface SimilarListingsProps {
  listings: SimilarListing[];
  currentPrice: number;
  isLoading?: boolean;
}

type SortKey = "title" | "sellerType" | "year" | "mileage" | "price" | "diff";
type SortDir = "asc" | "desc";

const parseMileage = (m: string) => parseInt(m.replace(/\D/g, "")) || 0;

const SimilarListings = ({ listings, currentPrice, isLoading }: SimilarListingsProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...listings].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "title": cmp = a.title.localeCompare(b.title); break;
      case "sellerType": cmp = a.sellerType.localeCompare(b.sellerType); break;
      case "year": cmp = (parseInt(a.year) || 0) - (parseInt(b.year) || 0); break;
      case "year": cmp = (parseInt(a.year) || 0) - (parseInt(b.year) || 0); break;
      case "mileage": cmp = parseMileage(a.mileage) - parseMileage(b.mileage); break;
      case "price": cmp = a.price - b.price; break;
      case "diff": cmp = (a.price - currentPrice) - (b.price - currentPrice); break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />;
    return sortDir === "asc"
      ? <ArrowUp className="w-3 h-3 text-primary" />
      : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl text-foreground">Lignende annonser</h2>
        <p className="text-sm text-muted-foreground">{listings.length} lignende biler på Finn.no</p>
      </div>

      <div className="bg-card rounded-2xl border border-border card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {([
                  { key: "title" as SortKey, label: "Bil" },
                  { key: "sellerType" as SortKey, label: "Selger" },
                  { key: "year" as SortKey, label: "År" },
                  { key: "mileage" as SortKey, label: "Km" },
                  { key: "price" as SortKey, label: "Pris" },
                  { key: "diff" as SortKey, label: "Forskjell" },
                ]).map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="text-left text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer hover:text-foreground transition-colors select-none"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.label}
                      <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((listing) => {
                const diff = listing.price - currentPrice;
                const diffPercent = Math.round((diff / currentPrice) * 100);

                return (
                  <tr
                    key={listing.finnCode}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {listing.title}
                      </a>
                    </td>
                    
                    <td className="px-4 py-3 text-sm text-foreground/80">{listing.sellerType || '–'}</td>
                    <td className="px-4 py-3 text-sm text-foreground/80">{listing.year}</td>
                    <td className="px-4 py-3 text-sm text-foreground/80">{listing.year}</td>
                    <td className="px-4 py-3 text-sm text-foreground/80">{listing.mileage}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">
                      {listing.price.toLocaleString("nb-NO")} kr
                    </td>
                    <td className="px-4 py-3">
                      {diff !== 0 && (
                        <span className={`text-sm font-medium ${diff < 0 ? "text-green-500" : "text-red-500"}`}>
                          {diff > 0 ? "+" : ""}{diffPercent}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SimilarListings;
