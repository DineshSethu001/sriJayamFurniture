
export default function CraftsmanshipSection({ products = [] }) {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl bg-[#39271c] text-white md:grid-cols-2">
        <div className="flex flex-col justify-center px-7 py-12 sm:px-12 sm:py-16 lg:px-16">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4ae7b]">
            Made with character
          </p>
          <h2 className="mt-5 text-3xl font-medium leading-tight sm:text-4xl">
            The beauty is in the details.
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/70">
            Beautiful wood grain, detailed carving, sturdy construction,
            and finishes that let the natural character of wood shine.
            Find a piece that feels right for your home.
          </p>
          <a
            href="#collections"
            className="mt-8 w-fit border-b border-[#d4ae7b] pb-2 text-sm font-semibold text-[#e8cba5] hover:text-white"
          >
            Explore the furniture →
          </a>
        </div>

        <div className="grid min-h-72 grid-cols-2">
          {products.slice(0, 2).map((product) => (
            <div
              key={product._id}
              className="relative min-h-72 overflow-hidden bg-[#4c3829]"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <p className="absolute bottom-5 left-4 right-4 text-sm font-medium">
                {product.name}
              </p>
            </div>
          ))}

          {products.length === 0 && (
            <div className="col-span-2 flex items-center justify-center p-8 text-center text-sm text-white/60">
              Your furniture photographs will appear here once products are added.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
