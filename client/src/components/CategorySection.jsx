
import furnitureImages from "../data/furnitureImages";

const categories = [
  { name: "Teak Furniture", subtitle: "Natural grain. Timeless beauty.", keywords: ["teak", "wood"] },
  { name: "Dining Sets", subtitle: "Made for gathering.", keywords: ["dining"] },
  { name: "Chairs", subtitle: "Comfort with character.", keywords: ["chair", "rocking"] },
  { name: "Swings & Jhulas", subtitle: "A traditional touch.", keywords: ["swing", "jhula", "cradle"] },
  { name: "Coffee Tables", subtitle: "Details that stand out.", keywords: ["coffee", "tea table", "tea-poy"] },
  { name: "Living Room", subtitle: "Make room for comfort.", keywords: ["sofa", "tv unit", "living"] },
];

export default function CategorySection({ products = [], onSelectCategory }) {
  return (
    <section className="px-5 pb-16 sm:px-8 sm:pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <p className="text-xs uppercase tracking-[0.25em] text-[#9b784f]">
            Find your style
          </p>
          <h2 className="mt-2 text-2xl font-medium sm:text-3xl">
            Explore by collection
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => {
            const matchingProduct = products.find((product) => {
              const text =
                `${product.name} ${product.category} ${product.description || ""}`.toLowerCase();

              return category.keywords.some((keyword) =>
                text.includes(keyword)
              );
            });

            const demo = furnitureImages.find((item) =>
              category.keywords.some((keyword) =>
                `${item.name} ${item.category}`.toLowerCase().includes(keyword)
              )
            );

            const image = matchingProduct?.imageUrl || demo?.image;

            return (
              <button
                type="button"
                key={category.name}
                onClick={() => onSelectCategory(category)}
                className="group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-xl border border-[#e7dccd] bg-[#39271c] p-4 text-left transition hover:-translate-y-1 hover:shadow-lg sm:min-h-48 sm:p-5"
              >
                {image && (
                  <img
                    src={image}
                    alt={category.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-700 group-hover:scale-105 group-hover:opacity-70"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/20" />

                <span className="relative text-xs text-white/80">
                  COLLECTION 0{index + 1}
                </span>

                <span className="relative text-white">
                  <span className="block text-sm font-semibold sm:text-base">
                    {category.name}
                  </span>
                  <span className="mt-1 block text-xs text-white/80">
                    {category.subtitle}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
