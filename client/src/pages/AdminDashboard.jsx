
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import ProductUploadForm from "../components/ProductUploadForm";

const navigation = [
  { id: "overview", label: "Overview", icon: "▦" },
  { id: "products", label: "Products", icon: "▤" },
  { id: "orders", label: "Orders", icon: "🛍" },
  { id: "offers", label: "Offers", icon: "%" },
  { id: "slider", label: "Homepage Slider", icon: "▧" },
];

const categories = [
  "Sofas",
  "Beds",
  "Dining Tables",
  "Wardrobes",
  "Chairs",
  "Coffee Tables",
  "TV Units",
  "Other",
];

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const initialEditForm = {
  name: "",
  description: "",
  price: "",
  category: "Sofas",
  isFeatured: false,
  isPublished: true,
};

function StatusBadge({ published }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        published
          ? "bg-green-50 text-green-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          published ? "bg-green-600" : "bg-amber-500"
        }`}
      />
      {published ? "Published" : "Draft"}
    </span>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ ...initialEditForm });
  const [editImage, setEditImage] = useState(null);
  const [editPreview, setEditPreview] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const redirectToLogin = useCallback(() => {
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  const loadProducts = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/api/products/admin/all");
      const result = response.data?.products;

      setProducts(Array.isArray(result) ? result : []);
    } catch (err) {
      if (err.response?.status === 401) {
        redirectToLogin();
        return;
      }

      setError(
        err.response?.data?.message ||
          "Could not load products. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    let active = true;

    async function initializeDashboard() {
      try {
        await api.get("/api/admin/auth/me");

        if (!active) return;

        await loadProducts();
      } catch (err) {
        if (!active) return;

        if (err.response?.status === 401) {
          redirectToLogin();
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to verify your admin session."
          );
          setLoading(false);
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    initializeDashboard();

    return () => {
      active = false;
    };
  }, [loadProducts, redirectToLogin]);

  useEffect(() => {
    if (!editImage) {
      setEditPreview("");
      return undefined;
    }

    const url = URL.createObjectURL(editImage);
    setEditPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [editImage]);

  const publishedCount = products.filter(
    (product) => product.isPublished
  ).length;

  const featuredCount = products.filter(
    (product) => product.isFeatured
  ).length;

  const filteredProducts = products.filter((product) => {
    const searchTerm = search.trim().toLowerCase();

    const matchesSearch =
      !searchTerm ||
      product.name?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm);

    const matchesCategory =
      categoryFilter === "All" ||
      product.category === categoryFilter;

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Published" && product.isPublished) ||
      (statusFilter === "Draft" && !product.isPublished);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  function showSuccess(message) {
    setSuccess(message);
    setError("");
  }

  async function handleProductCreated() {
    setShowAddForm(false);
    setActiveTab("products");
    showSuccess("Furniture added successfully.");
    await loadProducts();
  }

  function openEditModal(product) {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      category: product.category || "Other",
      isFeatured: Boolean(product.isFeatured),
      isPublished: Boolean(product.isPublished),
    });
    setEditImage(null);
    setError("");
    setSuccess("");
  }

  function closeEditModal() {
    if (savingEdit) return;

    setEditingProduct(null);
    setEditForm({ ...initialEditForm });
    setEditImage(null);
    setEditPreview("");
  }

  function handleEditChange(event) {
    const { name, value, checked, type } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleEditSubmit(event) {
    event.preventDefault();

    if (!editingProduct) return;

    const name = editForm.name.trim();
    const price = Number(editForm.price);

    if (!name) {
      setError("Product name is required.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }

    if (editImage) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(editImage.type)) {
        setError("Use a JPG, PNG, or WebP image.");
        return;
      }

      if (editImage.size > 5 * 1024 * 1024) {
        setError("Image must be 5 MB or smaller.");
        return;
      }
    }

    setSavingEdit(true);
    setError("");

    try {
      const data = new FormData();

      data.append("name", name);
      data.append("description", editForm.description.trim());
      data.append("price", String(price));
      data.append("category", editForm.category);
      data.append("isFeatured", String(editForm.isFeatured));
      data.append("isPublished", String(editForm.isPublished));

      if (editImage) {
        data.append("image", editImage);
      }

      await api.patch(
        `/api/products/${editingProduct._id}`,
        data
      );

      setEditingProduct(null);
      setEditForm({ ...initialEditForm });
      setEditImage(null);

      showSuccess("Product updated successfully.");
      await loadProducts();
    } catch (err) {
      if (err.response?.status === 401) {
        redirectToLogin();
        return;
      }

      setError(
        err.response?.data?.message ||
          "Could not update the product."
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleTogglePublished(product) {
    setUpdatingId(product._id);
    setError("");
    setSuccess("");

    try {
      await api.patch(`/api/products/${product._id}`, {
        isPublished: !product.isPublished,
      });

      showSuccess(
        product.isPublished
          ? "Product moved to drafts."
          : "Product published successfully."
      );

      await loadProducts();
    } catch (err) {
      if (err.response?.status === 401) {
        redirectToLogin();
        return;
      }

      setError(
        err.response?.data?.message ||
          "Could not change product publication status."
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}" permanently? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(product._id);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/api/products/${product._id}`);

      setProducts((previous) =>
        previous.filter((item) => item._id !== product._id)
      );

      showSuccess("Product deleted successfully.");
    } catch (err) {
      if (err.response?.status === 401) {
        redirectToLogin();
        return;
      }

      setError(
        err.response?.data?.message ||
          "Could not delete the product."
      );
    } finally {
      setDeletingId("");
    }
  }

  async function handleLogout() {
    try {
      await api.post("/api/admin/auth/logout");
    } catch (err) {
      console.error(
        "Logout request failed:",
        err.response?.data?.message || err.message
      );
    } finally {
      redirectToLogin();
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F2EC]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#D7C6B3] border-t-[#A87948]" />
          <p className="mt-4 text-sm text-[#78695D]">
            Verifying administrator session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F2EC] text-[#30251D] md:flex">
      {/* Sidebar */}
      <aside className="w-full bg-[#2A211B] p-5 text-white md:min-h-screen md:w-64 md:shrink-0">
        <Link to="/" className="block">
          <p className="text-xl font-semibold tracking-wide">
            Sri Jayam
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#D9B887]">
            Furnitures · Admin
          </p>
        </Link>

        <nav className="mt-7 flex gap-2 overflow-x-auto md:flex-col">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setError("");
                setSuccess("");
              }}
              className={`shrink-0 rounded-lg px-4 py-3 text-left text-sm transition ${
                activeTab === item.id
                  ? "bg-[#A87948] text-white"
                  : "text-[#E8DCCF] hover:bg-white/10"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full rounded-lg border border-white/20 px-4 py-3 text-left text-sm hover:bg-white/10"
        >
          ↪ Sign out
        </button>

        <Link
          to="/"
          className="mt-3 block px-4 py-2 text-sm text-[#D9B887] hover:underline"
        >
          ← View website
        </Link>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#8C7866]">
              Sri Jayam Furnitures / Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              {navigation.find((item) => item.id === activeTab)?.label}
            </h1>
            <p className="mt-2 text-sm text-[#78695D]">
              Manage your furniture business in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={loadProducts}
            disabled={loading}
            className="rounded-lg border border-[#D7C6B3] bg-white px-4 py-2 text-sm hover:bg-[#F1E6D8] disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="font-semibold"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            <span>{success}</span>
            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success"
              className="font-semibold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Overview */}
        {activeTab === "overview" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total Products",
                  value: products.length,
                  icon: "▤",
                },
                {
                  label: "Published Products",
                  value: publishedCount,
                  icon: "✓",
                },
                {
                  label: "Featured Products",
                  value: featuredCount,
                  icon: "★",
                },
                {
                  label: "Total Orders",
                  value: "—",
                  icon: "🛍",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[#E7DCCF] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#827264]">
                      {stat.label}
                    </p>
                    <span className="text-xl text-[#A87948]">
                      {stat.icon}
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-semibold">
                    {loading ? "…" : stat.value}
                  </p>
                  {stat.label === "Total Orders" && (
                    <p className="mt-2 text-xs text-[#827264]">
                      Order API not connected yet.
                    </p>
                  )}
                </div>
              ))}
            </div>

            <section className="mt-8 rounded-xl border border-[#E7DCCF] bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">
                    Your collection
                  </h2>
                  <p className="mt-1 text-sm text-[#827264]">
                    Recently added furniture products.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("products")}
                  className="font-medium text-[#8B6039] hover:underline"
                >
                  Manage products →
                </button>
              </div>

              {loading ? (
                <p className="py-8 text-sm text-[#827264]">
                  Loading products...
                </p>
              ) : products.length === 0 ? (
                <p className="py-8 text-sm text-[#827264]">
                  Your catalogue is empty. Add your first product.
                </p>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {products.slice(0, 3).map((product) => (
                    <div
                      key={product._id}
                      className="overflow-hidden rounded-xl border border-[#E7DCCF] bg-[#FAF7F2]"
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          className="h-44 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center bg-[#EEE5D9] text-sm text-[#827264]">
                          No image
                        </div>
                      )}
                      <div className="p-4">
                        <p className="font-semibold">{product.name}</p>
                        <p className="mt-1 text-sm text-[#827264]">
                          {product.category}
                        </p>
                        <p className="mt-3 font-semibold">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Products */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Total products",
                  value: products.length,
                  icon: "▤",
                },
                {
                  label: "Published",
                  value: publishedCount,
                  icon: "✓",
                },
                {
                  label: "Featured",
                  value: featuredCount,
                  icon: "★",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-[#E7DCCF] bg-white p-5 shadow-sm"
                >
                  <div>
                    <p className="text-sm text-[#827264]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {item.value}
                    </p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4E9DB] text-xl text-[#8B6039]">
                    {item.icon}
                  </span>
                </div>
              ))}
            </div>

            {/* Search and filters */}
            <section className="rounded-xl border border-[#E7DCCF] bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Product collection
                  </h2>
                  <p className="mt-1 text-sm text-[#827264]">
                    Browse and manage your furniture catalogue.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm((value) => !value);
                    setError("");
                    setSuccess("");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#62452F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#493321]"
                >
                  <span className="text-lg">＋</span>
                  {showAddForm ? "Close form" : "Add furniture"}
                </button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="relative md:col-span-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7866]">
                    ⌕
                  </span>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search furniture..."
                    aria-label="Search furniture"
                    className="w-full rounded-lg border border-[#D9CDBB] bg-[#FCFAF7] py-3 pl-9 pr-3 text-sm outline-none focus:border-[#80603B]"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value)
                  }
                  aria-label="Filter by category"
                  className="rounded-lg border border-[#D9CDBB] bg-[#FCFAF7] px-3 py-3 text-sm outline-none focus:border-[#80603B]"
                >
                  <option value="All">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  aria-label="Filter by publication status"
                  className="rounded-lg border border-[#D9CDBB] bg-[#FCFAF7] px-3 py-3 text-sm outline-none focus:border-[#80603B]"
                >
                  <option value="All">All statuses</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[#827264]">
                <span>
                  Showing {filteredProducts.length} of {products.length} products
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("All");
                    setStatusFilter("All");
                  }}
                  className="font-medium text-[#8B6039] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            </section>

            {/* Add product form */}
            {showAddForm && (
              <section className="rounded-xl border border-[#E7DCCF] bg-white p-4 sm:p-6">
                <ProductUploadForm
                  onProductCreated={handleProductCreated}
                />
              </section>
            )}

            {/* Product cards */}
            {loading ? (
              <div className="rounded-xl border border-[#E7DCCF] bg-white py-16 text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#D7C6B3] border-t-[#A87948]" />
                <p className="mt-4 text-sm text-[#827264]">
                  Loading your collection...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D7C6B3] bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4E9DB] text-2xl text-[#8B6039]">
                  ▤
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  No products found
                </h3>
                <p className="mt-2 text-sm text-[#827264]">
                  Try changing your filters or add a new furniture item.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("All");
                    setStatusFilter("All");
                    setShowAddForm(true);
                  }}
                  className="mt-5 rounded-lg bg-[#62452F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#493321]"
                >
                  + Add furniture
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <article
                    key={product._id}
                    className="group overflow-hidden rounded-2xl border border-[#E7DCCF] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Product image */}
                    <div className="relative overflow-hidden bg-[#F1EAE0]">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name || "Furniture"}
                          loading="lazy"
                          className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-56 items-center justify-center text-sm text-[#827264]">
                          No product image
                        </div>
                      )}

                      <div className="absolute left-3 top-3">
                        <StatusBadge published={product.isPublished} />
                      </div>

                      {product.isFeatured && (
                        <span className="absolute right-3 top-3 rounded-full bg-[#62452F] px-3 py-1 text-xs font-medium text-white shadow-sm">
                          ★ Featured
                        </span>
                      )}

                      <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-medium text-[#62452F] shadow-sm">
                        {product.category || "Other"}
                      </span>
                    </div>

                    {/* Product details */}
                    <div className="p-4">
                      <div className="min-h-[74px]">
                        <h3 className="line-clamp-2 text-base font-semibold text-[#30251D]">
                          {product.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#827264]">
                          {product.description || "No description added."}
                        </p>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-2 border-t border-[#EEE5DC] pt-4">
                        <div>
                          <p className="text-xs text-[#827264]">
                            Selling price
                          </p>
                          <p className="mt-1 text-xl font-semibold text-[#62452F]">
                            {formatPrice(product.price)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="rounded-lg border border-[#D9CDBB] px-3 py-2 text-sm font-medium text-[#62452F] transition hover:bg-[#F6F2EC]"
                        >
                          ✎ Edit
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(product)}
                          disabled={
                            updatingId === product._id ||
                            deletingId === product._id
                          }
                          className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            product.isPublished
                              ? "border border-[#D9CDBB] text-[#62452F] hover:bg-[#F6F2EC]"
                              : "bg-[#62452F] text-white hover:bg-[#493321]"
                          }`}
                        >
                          {updatingId === product._id
                            ? "Updating..."
                            : product.isPublished
                              ? "Unpublish"
                              : "Publish product"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          disabled={
                            deletingId === product._id ||
                            updatingId === product._id
                          }
                          className="rounded-lg border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === product._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <section className="rounded-xl border border-[#E7DCCF] bg-white p-6">
            <h2 className="text-xl font-semibold">Order Management</h2>
            <p className="mt-2 text-sm text-[#827264]">
              An order model and protected order API are needed to manage
              customer orders and revenue.
            </p>
          </section>
        )}

        {/* Offers */}
        {activeTab === "offers" && (
          <section className="rounded-xl border border-[#E7DCCF] bg-white p-6">
            <h2 className="text-xl font-semibold">Offers & Coupons</h2>
            <p className="mt-2 text-sm text-[#827264]">
              Discount creation, coupon validation, minimum purchase
              amounts, and expiry dates can be implemented next.
            </p>
          </section>
        )}

        {/* Homepage slider */}
        {activeTab === "slider" && (
          <section className="rounded-xl border border-[#E7DCCF] bg-white p-6">
            <h2 className="text-xl font-semibold">Homepage Slider</h2>
            <p className="mt-2 text-sm text-[#827264]">
              Connect configurable homepage slider images to MongoDB
              and Cloudinary.
            </p>
          </section>
        )}
      </main>

      {/* Edit product modal */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#201710]/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !savingEdit
            ) {
              closeEditModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-title"
            className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#FCFAF7] shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E7DCCF] bg-[#FCFAF7] px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A17A46]">
                  Product management
                </p>
                <h2
                  id="edit-product-title"
                  className="mt-1 text-xl font-semibold"
                >
                  Edit furniture
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={savingEdit}
                aria-label="Close edit form"
                className="rounded-lg px-3 py-2 text-xl text-[#827264] hover:bg-[#F1EAE0] disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit}
              className="space-y-5 p-5 sm:p-7"
            >
              <div>
                <label
                  htmlFor="edit-image"
                  className="mb-2 block text-sm font-medium"
                >
                  Replace product image (optional)
                </label>

                <div className="overflow-hidden rounded-xl border border-dashed border-[#CDB99D] bg-[#F5F0E8] p-3">
                  {(editPreview || editingProduct.imageUrl) ? (
                    <img
                      src={editPreview || editingProduct.imageUrl}
                      alt="Product preview"
                      className="h-48 w-full rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-[#827264]">
                      No image available
                    </div>
                  )}

                  <input
                    id="edit-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={savingEdit}
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;

                      if (!file) {
                        setEditImage(null);
                        return;
                      }

                      if (
                        ![
                          "image/jpeg",
                          "image/png",
                          "image/webp",
                        ].includes(file.type)
                      ) {
                        event.target.value = "";
                        setEditImage(null);
                        setError("Use a JPG, PNG, or WebP image.");
                        return;
                      }

                      if (file.size > 5 * 1024 * 1024) {
                        event.target.value = "";
                        setEditImage(null);
                        setError("Image must be 5 MB or smaller.");
                        return;
                      }

                      setError("");
                      setEditImage(file);
                    }}
                    className="mt-3 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#62452F] file:px-4 file:py-2 file:font-medium file:text-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Product name
                </label>
                <input
                  id="edit-name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  maxLength={150}
                  required
                  disabled={savingEdit}
                  className="w-full rounded-lg border border-[#D9CDBB] bg-white px-4 py-3 text-sm outline-none focus:border-[#80603B]"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={4}
                  maxLength={3000}
                  disabled={savingEdit}
                  className="w-full resize-y rounded-lg border border-[#D9CDBB] bg-white px-4 py-3 text-sm outline-none focus:border-[#80603B]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit-price"
                    className="mb-2 block text-sm font-medium"
                  >
                    Price (₹)
                  </label>
                  <input
                    id="edit-price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editForm.price}
                    onChange={handleEditChange}
                    required
                    disabled={savingEdit}
                    className="w-full rounded-lg border border-[#D9CDBB] bg-white px-4 py-3 text-sm outline-none focus:border-[#80603B]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-category"
                    className="mb-2 block text-sm font-medium"
                  >
                    Category
                  </label>
                  <select
                    id="edit-category"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    required
                    disabled={savingEdit}
                    className="w-full rounded-lg border border-[#D9CDBB] bg-white px-4 py-3 text-sm outline-none focus:border-[#80603B]"
                  >
                    {[
                      ...new Set([...categories, editForm.category]),
                    ].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3 rounded-xl bg-[#F5F0E8] p-4">
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={editForm.isFeatured}
                    onChange={handleEditChange}
                    disabled={savingEdit}
                    className="mt-1 accent-[#62452F]"
                  />
                  <span>
                    <span className="font-medium">
                      Feature on homepage
                    </span>
                    <span className="mt-1 block text-xs text-[#827264]">
                      Mark this product as featured.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={editForm.isPublished}
                    onChange={handleEditChange}
                    disabled={savingEdit}
                    className="mt-1 accent-[#62452F]"
                  />
                  <span>
                    <span className="font-medium">
                      Publish product
                    </span>
                    <span className="mt-1 block text-xs text-[#827264]">
                      Published products can appear in the storefront.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#E7DCCF] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={savingEdit}
                  className="rounded-lg border border-[#D9CDBB] px-5 py-3 text-sm font-semibold text-[#62452F] hover:bg-[#F1EAE0] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-lg bg-[#62452F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#493321] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingEdit ? "Saving changes..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
