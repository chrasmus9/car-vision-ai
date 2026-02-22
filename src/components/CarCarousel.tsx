import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";

interface CarCarouselProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const CarCarousel = ({ children, title, subtitle }: CarCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 4,
    containScroll: "trimSnaps",
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl text-foreground">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-9 h-9"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-9 h-9"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex -ml-5">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export const CarCarouselSlide = ({ children }: { children: React.ReactNode }) => (
  <div className="min-w-0 shrink-0 grow-0 basis-full sm:basis-1/2 lg:basis-1/4 pl-5">
    {children}
  </div>
);

export default CarCarousel;
