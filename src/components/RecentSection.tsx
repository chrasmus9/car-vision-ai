import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CarCard from "./CarCard";

const sampleCars = [
  {
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80",
    title: "Volkswagen Golf 1.5 TSI Style",
    price: "349 900 kr",
    year: "2021",
    mileage: "45 000 km",
    fuel: "Bensin",
    location: "Oslo",
    timeAgo: "5 min siden",
    riskLevel: "low" as const,
  },
  {
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&q=80",
    title: "Tesla Model 3 Long Range",
    price: "289 000 kr",
    year: "2020",
    mileage: "62 000 km",
    fuel: "Elektrisk",
    location: "Bergen",
    timeAgo: "12 min siden",
    riskLevel: "medium" as const,
  },
  {
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80",
    title: "Toyota RAV4 Hybrid AWD",
    price: "425 000 kr",
    year: "2022",
    mileage: "28 000 km",
    fuel: "Hybrid",
    location: "Trondheim",
    timeAgo: "20 min siden",
    riskLevel: "low" as const,
  },
  {
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80",
    title: "BMW 320i M Sport",
    price: "389 900 kr",
    year: "2019",
    mileage: "78 000 km",
    fuel: "Bensin",
    location: "Stavanger",
    timeAgo: "35 min siden",
    riskLevel: "high" as const,
  },
];

const RecentSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl text-foreground">Andre så nylig på</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full w-9 h-9">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full w-9 h-9">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sampleCars.map((car, i) => (
            <CarCard key={i} {...car} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentSection;
