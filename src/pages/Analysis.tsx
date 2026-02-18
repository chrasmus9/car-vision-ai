import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarOverview from "@/components/analysis/CarOverview";
import RiskAssessment from "@/components/analysis/RiskAssessment";
// SmartQuestions removed - questions now integrated into RiskAssessment
import PriceAnalysis from "@/components/analysis/PriceAnalysis";
import SpecsGrid from "@/components/analysis/SpecsGrid";
import EquipmentList from "@/components/analysis/EquipmentList";
import AISummary from "@/components/analysis/AISummary";
import RecallsSection from "@/components/analysis/RecallsSection";
import AnalysisLoading from "@/components/analysis/AnalysisLoading";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

export interface AnalysisData {
  summary: string;
  risks: { level: "high" | "medium" | "low"; title: string; category: string; description: string; question: string }[];
  highlights: string[];
  priceAssessment: string;
  overallRisk: "low" | "medium" | "high";
  recalls?: { title: string; status: "active" | "expired" | "completed"; date: string; description: string; severity: "high" | "medium" | "low"; advice: string }[];
}

const Analysis = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url") || "";
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState<"scraping" | "analyzing">("scraping");
  const [carData, setCarData] = useState<CarData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [similarListings, setSimilarListings] = useState<any[]>([]);
  const [priceStats, setPriceStats] = useState<any>(null);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);

  useEffect(() => {
    if (!url) {
      setError("Ingen URL oppgitt");
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
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
          subtitle: "",
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
          finnCode: url.match(/(\d{9,})/)?.[1] || "",
          imageUrl: raw.images?.[0] || "",
          images: raw.images || [],
          euExpiry: "",
          equipment: raw.equipment || [],
        };

        setCarData(car);

        // Step 2: AI Analysis + Search similar in parallel
        setLoadingStep("analyzing");
        
        const [aiResponse, searchResponse] = await Promise.all([
          supabase.functions.invoke("analyze-car", {
            body: { carData: { ...car, textContent: raw.textContent } },
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

        // Save to recent analyses
        const finnCode = url.match(/(\d{9,})/)?.[1] || "";
        const priceNum = parseInt(car.price.replace(/\D/g, "")) || 0;
        let priceDiffPercent: number | null = null;
        if (searchResult?.success && searchResult.data.stats?.avg && priceNum > 0) {
          priceDiffPercent = Math.round(((priceNum - searchResult.data.stats.avg) / searchResult.data.stats.avg) * 100);
        }

        await supabase.from("recent_analyses").upsert({
          finn_code: finnCode,
          title: car.title,
          price: car.price,
          year: String(car.year),
          mileage: car.mileage,
          fuel: car.fuel,
          location: car.location,
          image_url: car.imageUrl,
          overall_risk: aiResult.data.overallRisk || "low",
          finn_url: url,
          price_diff_percent: priceDiffPercent,
        } as any, { onConflict: "finn_code" });

        if (searchResult?.success) {
          const filtered = (searchResult.data.listings || []).filter(
            (l: any) => l.finnCode !== finnCode
          );
          setSimilarListings(filtered);
          setPriceStats(searchResult.data.stats);
        }
      } catch (err: any) {
        console.error("Analysis error:", err);
        setError(err.message);
        toast({
          title: "Feil",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [url]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <AnalysisLoading step={loadingStep} carData={carData} />
        <Footer />
      </div>
    );
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
        <CarOverview car={carData} />
        {analysis && <AISummary summary={analysis.summary} />}
        {priceNum > 0 && <PriceAnalysis price={priceNum} assessment={analysis?.priceAssessment} similarListings={similarListings} priceStats={priceStats} isLoadingSimilar={isLoadingSimilar} />}
        {analysis && <RecallsSection recalls={analysis.recalls || []} />}
        {analysis && <RiskAssessment risks={analysis.risks} highlights={analysis.highlights} />}
        <SpecsGrid car={carData} />
        {carData.equipment.length > 0 && <EquipmentList equipment={carData.equipment} />}
      </main>
      <Footer />
    </div>
  );
};

export default Analysis;
