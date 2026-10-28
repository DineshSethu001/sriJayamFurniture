
import { useEffect, useState } from "react";
import api from "../services/api";

const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProductUploadForm({ onProductCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  function handleImagesChange(event) {
    setError("");
    setSuccess("");

    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        !ALLOWED_TYPES.includes(file.type) ||
        file.size > MAX_IMAGE_SIZE
    );

    if (invalidFile) {
      setError(
        "Use JPG, PNG, or WebP images, with each image no larger than 5 MB."
      );
      return;
    }

    setImages((current) => [
      ...current,
      ...selectedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      })),
    ]);
  }

  function removeImage(id) {
    setImages((current) => current.filter((image) => image.id !== id));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (images.length === 0) {
      setError("Please select at least one furniture image.");
      return;
    }

    if (!name.trim() || !category.trim() || price === "" ||
        !Number.isFinite(Number(price)) || Number(price) < 0) {
      setError("Enter a valid product name, category, and price.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("category", category.trim());
    formData.append("isFeatured", String(isFeatured));
    formData.append("isPublished", String(isPublished));

    images.forEach(({ file }) => {
      formData.append("images", file);
    });

    setSubmitting(true);

    try {
      const response = await api.post("/api/products", formData);
      const product = response.data?.product;

      setSuccess(response.data?.message || "Furniture added successfully.");

      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setIsFeatured(false);
      setIsPublished(true);
      setImages([]);

      onProductCreated?.(product);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to add furniture. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium">Furniture name</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={150}
          required
          className="w-full rounded-xl border border-[#d8c8b4] bg-[#fbf8f2] px-4 py-3 outline-none focus:border-[#987348]"
          placeholder="e.g. Premium Teakwood Sofa"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={3000}
          rows={4}
          className="w-full rounded-xl border border-[#d8c8b4] bg-[#fbf8f2] px-4 py-3 outline-none focus:border-[#987348]"
          placeholder="Describe the furniture..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Price (₹)</label>
          <input
            type="number"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            min="0"
            step="0.01"
            required
            className="w-full rounded-xl border border-[#d8c8b4] bg-[#fbf8f2] px-4 py-3 outline-none focus:border-[#987348]"
            placeholder="25000"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
            className="w-full rounded-xl border border-[#d8c8b4] bg-[#fbf8f2] px-4 py-3 outline-none focus:border-[#987348]"
            placeholder="Sofas, Beds, Tables..."
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="text-sm font-medium">Furniture images</label>
          <span className="text-xs text-[#78685a]">
            {images.length}/{MAX_IMAGES} selected
          </span>
        </div>

        <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-[#cbb79e] bg-[#fbf8f2] px-5 py-8 text-center transition hover:border-[#987348]">
          <span className="text-2xl" aria-hidden="true">＋</span>
          <span className="mt-2 text-sm font-semibold">
            Choose multiple images
          </span>
          <span className="mt-1 text-xs text-[#78685a]">
            JPG, PNG or WebP · Up to 5 MB each
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImagesChange}
            disabled={images.length >= MAX_IMAGES || submitting}
            className="sr-only"
          />
        </label>

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative">
                <img
                  src={image.preview}
                  alt={`Furniture preview ${index + 1}`}
                  className="aspect-square w-full rounded-xl object-cover"
                />
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-[#38291f]/90 px-2 py-1 text-xs text-white">
                    Main image
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  aria-label={`Remove image ${index + 1}`}
                  disabled={submitting}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg shadow hover:bg-red-50"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-5 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(event) => setIsFeatured(event.target.checked)}
          />
          Featured furniture
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
          />
          Publish immediately
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-[#493427] px-6 py-3 font-medium text-white transition hover:bg-[#624631] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Uploading furniture..." : "Add furniture"}
      </button>
    </form>
  );
}
