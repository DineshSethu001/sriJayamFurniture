
import { useEffect, useState } from "react";
import api from "../services/api";

import Navbar from "../components/Navbar";
import HeroSlider from "../components/HeroSlider";
import BrandIntro from "../components/BrandIntro";
import CategorySection from "../components/CategorySection";
import ProductCollection from "../components/ProductCollection";
import CraftsmanshipSection from "../components/CraftsmanshipSection";
import SiteFooter from "../components/SiteFooter";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
       const { data } = await api.get("/api/products");
if (active) {
  setProducts(data.products ?? []);
}
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load the furniture collection."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const publishedProducts = products.filter(
    (product) => product.isPublished
  );

 const featuredProducts = publishedProducts
  .filter((product) => product.isFeatured)
  .slice(0, 6);

  function handleSelectCategory(category) {
    const exactMatch = publishedProducts.some(
      (product) =>
        product.category?.toLowerCase() === category.name.toLowerCase()
    );

    setSelectedCategory(exactMatch ? category.name : "All");
    setSearch("");
    document.getElementById("collection")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbf8f2] text-[#38291f]">
      <Navbar />

      <div className="bg-[#39271c] px-4 py-2.5 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[#ead4b5] sm:text-xs">
        Traditional craftsmanship · Made for your home
      </div>

      <main>
        <HeroSlider products={featuredProducts} />

        <BrandIntro />

        <CategorySection
          products={publishedProducts}
          onSelectCategory={handleSelectCategory}
        />

        <ProductCollection
          products={publishedProducts}
          loading={loading}
          error={error}
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <CraftsmanshipSection products={publishedProducts} />

        <section id="about" className="border-t border-[#e8ddcf] px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9b784f]">
              Our philosophy
            </p>
            <h2 className="mt-4 font-serif text-3xl italic sm:text-4xl">
              A little tradition. A lot of heart.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#78685a] sm:text-base">
              Sri Jayam Furnitures celebrates the warmth of wood and the
              beauty of traditional furniture. From family dining spaces to
              relaxing corners, find designs that feel personal and enduring.
            </p>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
