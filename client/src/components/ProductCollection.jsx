
import ProductCard from "./ProductCard";

export default function ProductCollection({
  products = [],
  loading,
  error,
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
}) {
  const categories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ].sort();

  const filteredProducts = products.filter((product) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [product.name, product.category, product.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));

    const matchesCategory =
      selectedCategory === "All" ||
      product.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <section
      id="collections"
      className="scroll-mt-20 bg-[#f1e9dd] px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9b784f]">
              Handpicked for you
            </p>
            <h2 className="mt-3 text-3xl font-medium sm:text-4xl">
              Furniture worth coming home to.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#78685a]">
              Explore our latest designs and handcrafted favourites.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search furniture..."
              aria-label="Search furniture"
              className="min-w-0 rounded-full border border-[#d8c8b4] bg-[#fbf8f2] px-5 py-3 text-sm outline-none focus:border-[#987348] sm:w-64"
            />

            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              aria-label="Filter by category"
              className="rounded-full border border-[#d8c8b4] bg-[#fbf8f2] px-5 py-3 text-sm outline-none focus:border-[#987348]"
            >
              <option value="All">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 border-b border-[#d9cbbb] pb-4 text-xs text-[#78685a]">
          {loading ? "Loading furniture..." : `${filteredProducts.length} pieces to explore`}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 py-10 sm:gap-6 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="aspect-[4/5] rounded-xl bg-[#e2d7c8]" />
                <div className="mt-4 h-4 w-3/4 rounded bg-[#e2d7c8]" />
                <div className="mt-3 h-4 w-1/3 rounded bg-[#e2d7c8]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="mt-8 rounded-xl bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ml-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xl font-medium">No furniture found.</p>
            <p className="mt-3 text-sm text-[#78685a]">
              Try another search or category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              className="mt-5 text-sm font-semibold text-[#765333] underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
