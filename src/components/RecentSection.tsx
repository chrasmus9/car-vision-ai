import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import CarCard from "./CarCard";
import CarCarousel, { CarCarouselSlide } from "./CarCarousel";

interface RecentCar {
  finn_code: string;
  title: string;
  price: string;
  year: string;
  mileage: string;
  fuel: string;
  location: string;
  image_url: string;
  overall_risk: string;
  price_diff_percent: number | null;
  finn_url: string;
  created_at: string;
}

const RecentSection = () => {
  const [cars, setCars] = useState<RecentCar[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      const { data } = await supabase
        .from("recent_analyses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12);

      if (data) setCars(data as unknown as RecentCar[]);
    };
    fetchRecent();
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
    <CarCarousel title="Andre så nylig på">
      {cars.map((car) => (
        <CarCarouselSlide key={car.finn_code}>
          <Link to={`/analyse?url=${encodeURIComponent(car.finn_url)}`}>
            <CarCard
              image={car.image_url}
              title={car.title}
              price={car.price}
              year={car.year}
              mileage={car.mileage}
              fuel={car.fuel}
              location={car.location}
              timeAgo={timeAgo(car.created_at)}
              priceDiffPercent={car.price_diff_percent}
              finnCode={car.finn_code}
              finnUrl={car.finn_url}
            />
          </Link>
        </CarCarouselSlide>
      ))}
    </CarCarousel>
  );
};

export default RecentSection;
