
import { useEffect, useState } from "react";
import api from "../services/api";

const fallbackSlides = [
  {
    name: "Timeless Teak Dining",
    description: "Bring warmth and elegance to every family gathering.",
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=2000&q=85",
    buttonText: "Explore Our Collection",
  },
  {
    name: "Elegant Living Spaces",
    description: "Beautiful furniture for the moments that matter.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85",
    buttonText: "Explore Our Collection",
  },
  {
    name: "Modern Wooden Interiors",
    description: "A perfect balance of craftsmanship and comfort.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85",
    buttonText: "Explore Our Collection",
  },
  {
    name: "Crafted for Your Home",
    description: "Discover furniture that reflects your style.",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=2000&q=85",
    buttonText: "Explore Our Collection",
  },
  {
    name: "Comfort Meets Tradition",
    description: "Create a welcoming home with timeless designs.",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=85",
    buttonText: "Explore Our Collection",
  },
  {
    name: "Designed to Last",
    description: "Make every corner of your home special.",
    image:
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=2000&q=85",
    buttonText: "Explore Our Collection",
  },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState(fallbackSlides);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadSlides() {
      try {
        const response = await api.get("/api/homepage-slides");
        const configuredSlides = (response.data.slides || [])
          .filter((slide) => slide.imageUrl)
          .slice(0, 6)
          .map((slide) => ({
            id: slide._id,
            name: slide.title,
            description: slide.description || "",
            image: slide.imageUrl,
            buttonText:
              slide.buttonText || "Explore Our Collection",
          }));

        if (active) {
          setSlides(
            configuredSlides.length > 0
              ? configuredSlides
              : fallbackSlides
          );
          setCurrent(0);
        }
      } catch (error) {
        console.error("Could not load homepage slides:", error);

        if (active) {
          setSlides(fallbackSlides);
          setCurrent(0);
        }
      }
    }

    loadSlides();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((previous) => (previous + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const previousSlide = () => {
    setCurrent(
      (previous) => (previous - 1 + slides.length) % slides.length
    );
  };

  const nextSlide = () => {
    setCurrent((previous) => (previous + 1) % slides.length);
  };

  const slide = slides[current] || slides[0];

  return (
    <section className="relative isolate h-[560px] min-h-[480px] w-full overflow-hidden bg-[#2b211a] sm:h-[650px] lg:h-[760px]">
      {slides.map((item, index) => (
        <div
          key={item.id || `${item.name}-${index}`}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={index !== current}
        >
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
            fetchPriority={index === current ? "high" : "auto"}
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 sm:px-10 lg:px-16">
        <div className="max-w-2xl text-white">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#e5c28b] sm:text-sm">
            Sri Jayam Furnitures
          </p>

          <h1
            key={slide.name}
            className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-7xl"
          >
            Furniture that
            <br />
            feels like <span className="text-[#e5c28b]">home.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
            {slide.description}
          </p>

          <a
            href="#collection"
            className="mt-8 inline-flex items-center gap-3 bg-[#b88a52] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#986b3b]"
          >
            {slide.buttonText}
            <span aria-hidden="true">→</span>
          </a>

          <p className="mt-5 text-sm text-white/70">{slide.name}</p>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous furniture image"
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/20 text-2xl text-white backdrop-blur-sm transition hover:bg-white hover:text-black sm:left-6"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next furniture image"
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/20 text-2xl text-white backdrop-blur-sm transition hover:bg-white hover:text-black sm:right-6"
          >
            ›
          </button>

          <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {slides.map((item, index) => (
              <button
                key={`${item.id || item.name}-dot-${index}`}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Show slide ${index + 1}`}
                aria-current={index === current ? "true" : undefined}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === current
                    ? "w-9 bg-[#e5c28b]"
                    : "w-2 bg-white/65 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
