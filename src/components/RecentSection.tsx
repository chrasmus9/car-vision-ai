import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import CarCard from "./CarCard";

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
        .limit(4);

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
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl text-foreground">Andre så nylig på</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cars.map((car) => (
            <Link key={car.finn_code} to={`/analyse?url=${encodeURIComponent(car.finn_url)}`}>
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
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentSection;
