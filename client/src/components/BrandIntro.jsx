
export default function BrandIntro() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_1.2fr] md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9b784f]">
            The Sri Jayam Collection
          </p>

          <h1 className="mt-4 max-w-xl text-4xl font-medium leading-tight sm:text-5xl lg:text-6xl">
            Wood with a story.
            <span className="block font-serif italic text-[#987348]">
              Furniture with soul.
            </span>
          </h1>
        </div>

        <div className="md:justify-self-end md:pb-2">
          <p className="max-w-lg text-sm leading-7 text-[#78685a] sm:text-base">
            From richly polished teak tables to beautifully carved chairs
            and traditional wooden swings, discover furniture that brings
            warmth and character to everyday living.
          </p>

          <a
            href="#collection"
            className="mt-5 inline-flex items-center gap-3 border-b border-[#987348] pb-2 text-sm font-semibold text-[#62452f] transition hover:gap-5"
          >
            Discover the collection <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
