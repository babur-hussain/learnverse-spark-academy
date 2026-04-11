
import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/UI/button";

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: Parameters<typeof useEmblaCarousel>[0];
  plugins?: Parameters<typeof useEmblaCarousel>[1];
  showArrows?: boolean;
}

interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, opts, plugins = [], children, showArrows = true, ...props }, ref) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
      align: "start",
      skipSnaps: false,
      dragFree: true,
      ...opts
    }, plugins);

    const [prevBtnEnabled, setPrevBtnEnabled] = React.useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = React.useState(false);

    const onSelect = React.useCallback(() => {
      if (!emblaApi) return;
      setPrevBtnEnabled(emblaApi.canScrollPrev());
      setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    React.useEffect(() => {
      if (!emblaApi) return;
      onSelect();
      emblaApi.on("select", onSelect);
      emblaApi.on("reInit", onSelect);
      return () => {
        emblaApi.off("select", onSelect);
        emblaApi.off("reInit", onSelect);
      };
    }, [emblaApi, onSelect]);

    return (
      <div className={cn("relative", className)} {...props}>
        <div className="overflow-hidden rounded-lg" ref={emblaRef}>
          <div className="flex -ml-4">
            {React.Children.map(children, (child, index) => (
              <div className="pl-4 min-w-0 flex-shrink-0" key={index}>
                {child}
              </div>
            ))}
          </div>
        </div>
        {showArrows && (
          <>
            <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-2 z-10">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-md bg-white"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!prevBtnEnabled}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Previous slide</span>
              </Button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-0 -mr-2 z-10">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-md bg-white"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!nextBtnEnabled}
              >
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Next slide</span>
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }
);
Carousel.displayName = "Carousel";

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex h-full w-full min-w-[270px] max-w-[350px]", className)}
        {...props}
      />
    );
  }
);
CarouselItem.displayName = "CarouselItem";

export { Carousel, CarouselItem };
