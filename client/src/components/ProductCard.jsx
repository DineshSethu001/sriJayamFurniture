
import { useEffect, useState } from "react";

export default function ProductCard({ product }) {
  const productImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((image) =>
          typeof image === "string" ? image : image.url
        ).filter(Boolean)
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [product._id]);

  function showPrevious(event) {
    event.stopPropagation();
    setActiveIndex((current) =>
      (current - 1 + productImages.length) % productImages.length
    );
  }

  function showNext(event) {
    event.stopPropagation();
    setActiveIndex((current) =>
      (current + 1) % productImages.length
    );
  }

  let touchStartX = 0;

  function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
  }

  function handleTouchEnd(event) {
    const difference = event.changedTouches[0].clientX - touchStartX;

    if (Math.abs(difference) < 40 || productImages.length < 2) return;

    setActiveIndex((current) =>
      difference < 0
        ? (current + 1) % productImages.length
        : (current - 1 + productImages.length) % productImages.length
    );
  }

  return (
    <article className="group min-w-0">
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#e2d7c8]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {productImages.length > 0 ? (
          <img
            key={productImages[activeIndex]}
            src={productImages[activeIndex]}
            alt={`${product.name} — image ${activeIndex + 1}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#78685a]">
            No image available
          </div>
        )}

        {product.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-[#fbf8f2]/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#765333]">
            Featured
          </span>
        )}

        {productImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label={`Previous image of ${product.name}`}
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-[#493427] shadow transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={showNext}
              aria-label={`Next image of ${product.name}`}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-[#493427] shadow transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {productImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show image ${index + 1} of ${product.name}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  className={`h-2 rounded-full transition-all ${
                    activeIndex === index
                      ? "w-5 bg-white"
                      : "w-2 bg-white/60 hover:bg-white"
                  }`}
                />
              ))}
            </div>

            <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-xs text-white">
              {activeIndex + 1}/{productImages.length}
            </span>
          </>
        )}
      </div>

      <div className="pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b784f]">
          {product.category}
        </p>

        <h3 className="mt-1.5 line-clamp-2 text-sm font-medium leading-6 text-[#38291f] sm:text-base">
          {product.name}
        </h3>

        <p className="mt-2 text-base font-semibold text-[#493427] sm:text-lg">
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(Number(product.price) || 0)}
        </p>

        {productImages.length > 1 && (
          <p className="mt-1 text-xs text-[#78685a]">
            {productImages.length} product views
          </p>
        )}
      </div>
    </article>
  );
}
