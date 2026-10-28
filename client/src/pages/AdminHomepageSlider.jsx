
import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  title: "",
  description: "",
  buttonText: "Explore Our Collection",
  order: "0",
  isActive: true,
};

export default function AdminHomepageSlider() {
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadSlides() {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/api/homepage-slides/admin/all");
      setSlides(data.slides || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load homepage slides."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSlides();
  }, []);

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(image);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  function resetForm() {
    setForm(emptyForm);
    setImage(null);
    setEditingId(null);
    setMessage("");
    setError("");
  }

  function startEditing(slide) {
    setEditingId(slide._id);
    setForm({
      title: slide.title || "",
      description: slide.description || "",
      buttonText: slide.buttonText || "Explore Our Collection",
      order: String(slide.order ?? 0),
      isActive: Boolean(slide.isActive),
    });
    setImage(null);
    setPreview(slide.imageUrl || "");
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!editingId && !image) {
      setError("Choose a banner image before creating a slide.");
      return;
    }

    const order = Number(form.order);
    if (!Number.isInteger(order) || order < 0) {
      setError("Order must be a non-negative whole number.");
      return;
    }

    const data = new FormData();
    data.append("title", form.title.trim());
    data.append("description", form.description.trim());
    data.append("buttonText", form.buttonText.trim());
    data.append("order", String(order));
    data.append("isActive", String(form.isActive));

    if (image) data.append("image", image);

    setSaving(true);

    try {
      if (editingId) {
        await api.patch(`/api/homepage-slides/${editingId}`, data);
        setMessage("Homepage slide updated.");
      } else {
        await api.post("/api/homepage-slides", data);
        setMessage("Homepage slide created.");
      }

      resetForm();
      await loadSlides();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save homepage slide."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(slide) {
    setError("");
    setMessage("");

    try {
      await api.patch(`/api/homepage-slides/${slide._id}`, {
        isActive: !slide.isActive,
      });
      await loadSlides();
      setMessage("Slide status updated.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to change slide status."
      );
    }
  }

  async function deleteSlide(slide) {
    const confirmed = window.confirm(
      `Delete the homepage slide "${slide.title}"? This also removes its Cloudinary image.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/api/homepage-slides/${slide._id}`);
      if (editingId === slide._id) resetForm();
      await loadSlides();
      setMessage("Homepage slide deleted.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete homepage slide."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-4 py-8 text-[#38291f] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#9b784f]">
              Sri Jayam Furnitures / Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Homepage Slider
            </h1>
            <p className="mt-2 text-sm text-[#78685a]">
              Manage your homepage banner images and content.
            </p>
          </div>

          <button
            type="button"
            onClick={loadSlides}
            className="rounded-xl border border-[#d8c8b4] bg-white px-4 py-3 text-sm hover:bg-[#fbf8f2]"
          >
            ↻ Refresh
          </button>
        </div>

        {(error || message) && (
          <p
            role={error ? "alert" : "status"}
            className={`mt-5 rounded-xl p-4 text-sm ${
              error
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-800"
            }`}
          >
            {error || message}
          </p>
        )}

        <section className="mt-8 rounded-2xl border border-[#e5d8c8] bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit slide" : "Add a new slide"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Banner title
                </label>
                <input
                  required
                  maxLength={150}
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#d8c8b4] px-4 py-3 outline-none focus:border-[#987348]"
                  placeholder="e.g. Crafted for Your Home"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  maxLength={1000}
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#d8c8b4] px-4 py-3 outline-none focus:border-[#987348]"
                  placeholder="Write a short introduction..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Button text
                </label>
                <input
                  maxLength={60}
                  value={form.buttonText}
                  onChange={(e) =>
                    setForm({ ...form, buttonText: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#d8c8b4] px-4 py-3 outline-none focus:border-[#987348]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Display order
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#d8c8b4] px-4 py-3 outline-none focus:border-[#987348]"
                  />
                </div>

                <label className="flex items-center gap-2 self-end pb-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />
                  Active on homepage
                </label>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Banner image {editingId ? "(optional replacement)" : ""}
              </label>

              <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#d8c8b4] bg-[#fbf8f2] text-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Banner preview"
                    className="h-56 w-full object-cover"
                  />
                ) : (
                  <>
                    <span className="text-3xl">＋</span>
                    <span className="mt-2 text-sm font-medium">
                      Choose banner image
                    </span>
                    <span className="mt-1 text-xs text-[#78685a]">
                      JPG, PNG or WebP · Maximum 5 MB
                    </span>
                  </>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </label>

              {preview && (
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreview(editingId
                      ? slides.find((s) => s._id === editingId)?.imageUrl || ""
                      : "");
                  }}
                  className="mt-2 text-xs font-medium text-[#765333] underline"
                >
                  Clear selected replacement
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                disabled={saving}
                type="submit"
                className="rounded-full bg-[#493427] px-6 py-3 text-sm font-semibold text-white hover:bg-[#624631] disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Upload slide"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-[#d8c8b4] px-6 py-3 text-sm"
                >
                  Cancel editing
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Existing slides</h2>
            <span className="text-sm text-[#78685a]">
              {slides.length}/8 slides
            </span>
          </div>

          {loading ? (
            <p className="py-10 text-sm text-[#78685a]">Loading slides...</p>
          ) : slides.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-[#e5d8c8] bg-white p-8 text-center text-sm text-[#78685a]">
              No slides yet. Upload your first homepage banner above.
            </div>
          ) : (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {slides.map((slide) => (
                <article
                  key={slide._id}
                  className="overflow-hidden rounded-2xl border border-[#e5d8c8] bg-white shadow-sm"
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-[#9b784f]">
                          Order {slide.order}
                        </p>
                        <h3 className="mt-1 font-semibold">{slide.title}</h3>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          slide.isActive
                            ? "bg-green-50 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {slide.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-[#78685a]">
                      {slide.description || "No description"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(slide)}
                        className="rounded-full border border-[#d8c8b4] px-4 py-2 text-xs font-medium hover:bg-[#fbf8f2]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleActive(slide)}
                        className="rounded-full border border-[#d8c8b4] px-4 py-2 text-xs font-medium hover:bg-[#fbf8f2]"
                      >
                        {slide.isActive ? "Hide" : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteSlide(slide)}
                        className="rounded-full border border-red-200 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
