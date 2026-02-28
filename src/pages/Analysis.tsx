import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarOverview from "@/components/analysis/CarOverview";
import RiskAssessment from "@/components/analysis/RiskAssessment";
import PriceAnalysis from "@/components/analysis/PriceAnalysis";
import SimilarListings from "@/components/analysis/SimilarListings";
import AllInfoCards from "@/components/analysis/AllInfoCards";
import AISummary from "@/components/analysis/AISummary";
import RecallsSection from "@/components/analysis/RecallsSection";
import AnalysisLoading from "@/components/analysis/AnalysisLoading";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";


export interface CarData {
  title: string;
  subtitle: string;
  price: string;
  year: number;
  mileage: string;
  fuel: string;
  gearbox: string;
  power: string;
  drivetrain: string;
  body: string;
  color: string;
  weight: string;
  co2: string;
  seats: number;
  doors: number;
  regNr: string;
  vin: string;
  firstReg: string;
  seller: string;
  location: string;
  finnCode: string;
  imageUrl: string;
  images: string[];
  euExpiry: string;
  equipment: string[];
  owners?: number;
  rekkevidde?: string;
  batteryCapacityKwh?: number;
}

export interface AnalysisData {
  summary: string;
  risks: { level: "high" | "medium" | "low"; title: string; category: string; description: string; question: string }[];
  highlights: string[];
  priceAssessment: string;
  overallRisk: "low" | "medium" | "high";
  recalls?: { title: string; status: "active" | "expired" | "completed"; date: string; description: string; severity: "high" | "medium" | "low"; advice: string }[];
}

const CACHE_TTL_HOURS = 24;

const Analysis = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url") || "";
  
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState<"scraping" | "vegvesen" | "analyzing" | "finalizing" | "done">("scraping");
  const [fromCache, setFromCache] = useState(false);
  const [carData, setCarData] = useState<CarData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [similarListings, setSimilarListings] = useState<any[]>([]);
  const [priceStats, setPriceStats] = useState<any>(null);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [vegvesenData, setVegvesenData] = useState<any>(null);

  useEffect(() => {
    if (!url) {
      setError("Ingen URL oppgitt");
      setLoading(false);
      return;
    }

    const finnCode = url.match(/(\d{9,})/)?.[1] || "";

    const fetchAnalysis = async () => {
      try {
        // Check cache first
        if (finnCode) {
          const { data: cached } = await supabase
            .from("analysis_cache")
            .select("*")
            .eq("finn_code", finnCode)
            .single();

          if (cached) {
            const cacheAge = (Date.now() - new Date(cached.created_at).getTime()) / (1000 * 60 * 60);
            if (cacheAge < CACHE_TTL_HOURS) {
              // Use cached data — skip loading entirely
              setFromCache(true);
              setCarData(cached.car_data as unknown as CarData);
              setAnalysis(cached.analysis_data as unknown as AnalysisData);
              setVegvesenData(cached.vegvesen_data);
              setSimilarListings((cached.similar_listings as any[]) || []);
              setPriceStats(cached.price_stats);
              setLoading(false);
              window.scrollTo({ top: 0, behavior: "smooth" });

              // Ensure user_id is set on cached entry for logged-in user (server-side)
              if (user?.id && !cached.user_id) {
                supabase.functions.invoke("save-analysis-cache", {
                  body: {
                    finn_code: finnCode,
                    finn_url: url,
                    car_data: cached.car_data,
                    analysis_data: cached.analysis_data,
                    vegvesen_data: cached.vegvesen_data,
                    similar_listings: cached.similar_listings,
                    price_stats: cached.price_stats,
                    user_id: user.id,
                  },
                }).catch(() => {});
              }
              return;
            }
          }
        }

        // Step 1: Scrape
        setLoadingStep("scraping");
        const { data: scrapeResult, error: scrapeError } = await supabase.functions.invoke("scrape-finn", {
          body: { url },
        });

        if (scrapeError || !scrapeResult?.success) {
          throw new Error(scrapeResult?.error || scrapeError?.message || "Kunne ikke hente annonsen");
        }

        const raw = scrapeResult.data;
        const specs = raw.specs || {};

        const car: CarData = {
          title: raw.title || "Ukjent bil",
          subtitle: raw.subtitle || "",
          price: raw.price || "Ikke oppgitt",
          year: parseInt(specs.year) || 0,
          mileage: specs.mileage || "Ikke oppgitt",
          fuel: specs.fuel || "Ikke oppgitt",
          gearbox: specs.gearbox || "Ikke oppgitt",
          power: specs.power || "",
          drivetrain: specs.drivetrain || "",
          body: specs.body || "",
          color: specs.color || "",
          weight: specs.weight || "",
          co2: specs.co2 || "",
          seats: parseInt(specs.seats) || 0,
          doors: parseInt(specs.doors) || 0,
          regNr: specs.regNr || "",
          vin: specs.vin || "",
          firstReg: specs.firstReg || "",
          seller: raw.seller || "Privat",
          location: specs.location || "",
          finnCode: finnCode,
          imageUrl: raw.images?.[0] || "",
          images: raw.images || [],
          euExpiry: "",
          equipment: raw.equipment || [],
          owners: raw.owners || undefined,
          rekkevidde: raw.rekkevidde || undefined,
          batteryCapacityKwh: raw.batteryCapacityKwh || undefined,
          garanti: raw.garanti || undefined,
          servicehistorikk: raw.servicehistorikk || undefined,
        } as any;

        setCarData(car);

        // Step 2: Vegvesen lookup
        setLoadingStep("vegvesen");
        let vegvesen = null;
        if (car.vin || car.regNr) {
          try {
            const { data: vResult } = await supabase.functions.invoke("vegvesen-lookup", {
              body: { vin: car.vin || undefined, regNr: car.regNr || undefined },
            });
            if (vResult?.success) {
              vegvesen = vResult.data;
              setVegvesenData(vegvesen);
            }
          } catch (e) {
            console.warn("Vegvesen lookup failed:", e);
          }
        }

        // Step 3: AI Analysis + Search similar in parallel
        setLoadingStep("analyzing");

        const priceNum2 = parseInt(car.price.replace(/\D/g, "")) || 0;

        const [aiResponse, searchResponse] = await Promise.all([
          supabase.functions.invoke("analyze-car", {
            body: {
              carData: { ...car, textContent: raw.textContent },
              vegvesenData: vegvesen,
              finnCode,
              finnUrl: url,
              recentData: {
                title: car.title,
                price: car.price,
                year: String(car.year),
                mileage: car.mileage,
                fuel: car.fuel,
                location: car.location,
                imageUrl: car.imageUrl,
                priceDiffPercent: null, // will be updated after search completes
              },
            },
          }),
          supabase.functions.invoke("search-finn", {
            body: {
              make: specs.make,
              model: specs.model,
              yearFrom: parseInt(specs.year) ? parseInt(specs.year) - 1 : undefined,
              yearTo: parseInt(specs.year) ? parseInt(specs.year) + 1 : undefined,
              fuel: specs.fuel,
            },
          }),
        ]);

        const { data: aiResult, error: aiError } = aiResponse;
        const { data: searchResult } = searchResponse;

        if (aiError || !aiResult?.success) {
          throw new Error(aiResult?.error || aiError?.message || "AI-analyse feilet");
        }

        setAnalysis(aiResult.data);

        // Process similar listings
        const priceNum = parseInt(car.price.replace(/\D/g, "")) || 0;
        let priceDiffPercent: number | null = null;
        let filteredListings: any[] = [];

        if (searchResult?.success) {
          filteredListings = (searchResult.data.listings || []).filter(
            (l: any) => l.finnCode !== finnCode
          );
          setSimilarListings(filteredListings);
          setPriceStats(searchResult.data.stats);

          if (searchResult.data.stats?.avg && priceNum > 0) {
            priceDiffPercent = Math.round(((priceNum - searchResult.data.stats.avg) / searchResult.data.stats.avg) * 100);
          }

          // Enrich similar listings with Vegvesen data (for missing variant/drivetrain)
          if (filteredListings.length > 0) {
            supabase.functions.invoke("enrich-listings", {
              body: {
                listings: filteredListings.map((l: any) => ({
                  finnCode: l.finnCode,
                  url: l.url,
                  variant: l.variant,
                  drivetrain: l.drivetrain,
                })),
              },
            }).then(({ data: enrichResult }) => {
              if (enrichResult?.success && enrichResult.data) {
                setSimilarListings(prev =>
                  prev.map(l => {
                    const enriched = enrichResult.data[l.finnCode];
                    if (enriched) {
                      return {
                        ...l,
                        variant: enriched.variant || l.variant,
                        drivetrain: enriched.drivetrain || l.drivetrain,
                      };
                    }
                    return l;
                  })
                );
              }
            }).catch(e => console.warn("Enrichment failed:", e));
          }
        }

        // recent_analyses is now written server-side by analyze-car edge function

        // Save to analysis cache (server-side)
        supabase.functions.invoke("save-analysis-cache", {
          body: {
            finn_code: finnCode,
            finn_url: url,
            car_data: car,
            analysis_data: aiResult.data,
            vegvesen_data: vegvesen,
            similar_listings: filteredListings,
            price_stats: searchResult?.data?.stats || null,
            user_id: user?.id || null,
          },
        }).catch(e => console.warn("Cache save failed:", e));

      } catch (err: any) {
        console.error("Analysis error:", err);
        setError(err.message);
      } finally {
        setLoadingStep("done");
        // Wait for loading screen fade-out (400ms) before showing results
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchAnalysis();
  }, [url]);

  if (loading) {
    return <AnalysisLoading loadingStep={loadingStep} fromCache={fromCache} />;
  }

  if (error || !carData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-32 text-center space-y-4">
          <h1 className="text-2xl text-foreground">Noe gikk galt</h1>
          <p className="text-muted-foreground">{error || "Kunne ikke hente data fra annonsen."}</p>
          <a href="/" className="text-primary underline text-sm">Prøv igjen</a>
        </div>
        <Footer />
      </div>
    );
  }

  const priceNum = parseInt(carData.price.replace(/\D/g, "")) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <CarOverview car={{
          ...carData,
          maxTowingWeight: vegvesenData?.towWeight ? `${vegvesenData.towWeight.toLocaleString("nb-NO")} kg` : null,
          topSpeed: vegvesenData?.maxSpeed ? `${Array.isArray(vegvesenData.maxSpeed) ? vegvesenData.maxSpeed[0] : vegvesenData.maxSpeed} km/t` : null,
          horsepower: (() => {
            const m = carData.power?.match(/([\d\s]+)\s*hk/i);
            return m ? `${m[1].replace(/\s/g, '')} hk` : null;
          })(),
          rekkevidde: carData.rekkevidde || null,
          consumption: vegvesenData?.consumption ? String(vegvesenData.consumption).replace('.', ',') : null,
          isElectric: carData.fuel?.toLowerCase() === 'el' || carData.fuel?.toLowerCase()?.includes('elektr') || false,
          isHybrid: carData.fuel?.toLowerCase()?.includes('hybrid') || false,
          hybridKategori: vegvesenData?.hybridKategori || null,
        }} />

        {/* Row A: AI-oppsummering + Prisanalyse side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AISummary summary={analysis?.summary || ""} />
          {priceNum > 0 && (
            <PriceAnalysis
              price={priceNum}
              assessment={analysis?.priceAssessment}
              priceStats={priceStats}
              isLoadingSimilar={isLoadingSimilar}
            />
          )}
        </div>

        {/* Row B: All info cards in one wrapping row */}
        <AllInfoCards
          owners={carData.owners}
          lastEuKontroll={vegvesenData?.lastEuKontroll}
          nextEuKontrollDeadline={vegvesenData?.nextEuKontrollDeadline}
          mileage={carData.mileage}
          year={carData.year}
          registrertForstegangNorgeDato={vegvesenData?.registrertForstegangNorgeDato}
          bruktimportert={vegvesenData?.bruktimportert}
          regNr={carData.regNr}
          garanti={(carData as any).garanti || null}
          servicehistorikk={(carData as any).servicehistorikk || null}
        />

        {/* Høydepunkter + Risikoer */}
        {analysis && <RiskAssessment risks={analysis.risks} highlights={analysis.highlights} highlightsFirst />}

        {/* Tilbakekallinger */}
        {analysis && (
          <RecallsSection recalls={analysis.recalls || []} />
        )}

        <SimilarListings
          listings={similarListings}
          currentPrice={priceNum}
          isLoading={isLoadingSimilar}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Analysis;
