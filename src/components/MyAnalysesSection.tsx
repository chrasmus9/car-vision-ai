import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import CarCard from "./CarCard";
import CarCarousel, { CarCarouselSlide } from "./CarCarousel";

interface CachedAnalysis {
  finn_code: string;
  finn_url: string | null;
  car_data: any;
  created_at: string;
}

const MyAnalysesSection = () => {
  const [cars, setCars] = useState<CachedAnalysis[]>([]);

  useEffect(() => {
    const fetchMine = async () => {
      const { data } = await supabase
        .from("analysis_cache")
        .select("finn_code, finn_url, car_data, created_at")
        .order("created_at", { ascending: false })
        .limit(12);

      if (data && data.length > 0) setCars(data);
    };
    fetchMine();
  }, []);

  if (cars.length === 0) return null;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Akkurat nå";
    if (mins < 60) return `${mins} min siden`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}t siden`;
    return `${Math.floor(hours / 24)}d siden`;
  };

  return (
    <CarCarousel title="Dine analyser">
      {cars.map((item) => {
        const car = item.car_data as any;
        const url = item.finn_url || `https://www.finn.no/mobility/item/${item.finn_code}`;
        return (
          <CarCarouselSlide key={item.finn_code}>
            <Link to={`/analyse?url=${encodeURIComponent(url)}`}>
              <CarCard
                image={car?.imageUrl || car?.image_url || "/placeholder.svg"}
                title={car?.title || "Ukjent bil"}
                price={car?.price || "–"}
                year={car?.year?.toString() || "–"}
                mileage={car?.mileage || "–"}
                fuel={car?.fuel || "–"}
                location={car?.location || "–"}
                timeAgo={timeAgo(item.created_at)}
              />
            </Link>
          </CarCarouselSlide>
        );
      })}
    </CarCarousel>
  );
};

export default MyAnalysesSection;
