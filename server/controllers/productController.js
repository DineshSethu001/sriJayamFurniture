
const mongoose = require("mongoose");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

function uploadImage(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "sri-jayam-furnitures",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Image upload failed."));
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

async function removeImage(publicId) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary cleanup failed:", error.message);
  }
}

async function removeImages(publicIds = []) {
  const uniqueIds = [...new Set(publicIds.filter(Boolean))];
  await Promise.all(uniqueIds.map(removeImage));
}

function getUploadedFiles(req) {
  // New multi-image field, with compatibility for the old single-image field.
  if (req.files) {
    return [...(req.files.images || []), ...(req.files.image || [])];
  }

  // Optional compatibility if another route still uses upload.single().
  return req.file ? [req.file] : [];
}

function parseBoolean(value, defaultValue) {
  if (value === undefined) return defaultValue;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
}

function validateProductFields(body) {
  const { name, price, category, description } = body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 150 ||
    typeof category !== "string" ||
    !category.trim() ||
    price === undefined ||
    price === "" ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    return "Provide a valid name, category, and non-negative price.";
  }

  if (
    description !== undefined &&
    (typeof description !== "string" || description.length > 3000)
  ) {
    return "Description must be 3000 characters or fewer.";
  }

  return null;
}

function getAllPublicIds(product) {
  return [
    product.imagePublicId,
    ...(product.images || []).map((image) => image.publicId),
  ].filter(Boolean);
}

// Public: published furniture
exports.getProducts = async (req, res) => {
  try {
    const filter = { isPublished: true };

    if (req.query.featured === "true") {
      filter.isFeatured = true;
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({ products });
  } catch (error) {
    console.error("Get products failed:", error.message);
    return res.status(500).json({ message: "Unable to load products." });
  }
};

// Admin: all furniture
exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.json({ products });
  } catch (error) {
    console.error("Get admin products failed:", error.message);
    return res.status(500).json({ message: "Unable to load admin products." });
  }
};

// Admin: create furniture with up to 8 images
exports.createProduct = async (req, res) => {
  const uploadedImages = [];

  try {
    const validationError = validateProductFields(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const files = getUploadedFiles(req);

    if (files.length === 0) {
      return res.status(400).json({
        message: "Please upload at least one product image.",
      });
    }

    if (files.length > 8) {
      return res.status(400).json({
        message: "Upload a maximum of 8 images per product.",
      });
    }

    const isFeatured = parseBoolean(req.body.isFeatured, false);
    const isPublished = parseBoolean(req.body.isPublished, true);

    if (isFeatured === null || isPublished === null) {
      return res.status(400).json({
        message: "Invalid featured or published setting.",
      });
    }

    // Sequential uploads make cleanup of partially uploaded images straightforward.
    for (const file of files) {
      const result = await uploadImage(file.buffer);
      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    const firstImage = uploadedImages[0];

    const product = await Product.create({
      name: req.body.name.trim(),
      description: (req.body.description || "").trim(),
      price: Number(req.body.price),
      category: req.body.category.trim(),

      // Keep the first image available to legacy components.
      imageUrl: firstImage.url,
      imagePublicId: firstImage.publicId,
      images: uploadedImages,

      isFeatured,
      isPublished,
    });

    return res.status(201).json({
      message: "Furniture added successfully.",
      product,
    });
  } catch (error) {
    await removeImages(uploadedImages.map((image) => image.publicId));

    console.error("Create product failed:", error.message);
    return res.status(500).json({ message: "Unable to create product." });
  }
};

// Admin: update details and optionally replace all product images
exports.updateProduct = async (req, res) => {
  let newImages = [];
  let savedSuccessfully = false;

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const files = getUploadedFiles(req);

    if (files.length > 8) {
      return res.status(400).json({
        message: "Upload a maximum of 8 images per product.",
      });
    }

    const {
      name,
      description,
      price,
      category,
      isFeatured,
      isPublished,
    } = req.body;

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim() ||
        name.trim().length > 150
      ) {
        return res.status(400).json({ message: "Enter a valid product name." });
      }

      product.name = name.trim();
    }

    if (description !== undefined) {
      if (
        typeof description !== "string" ||
        description.length > 3000
      ) {
        return res.status(400).json({
          message: "Description must be 3000 characters or fewer.",
        });
      }

      product.description = description.trim();
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return res.status(400).json({ message: "Enter a valid category." });
      }

      product.category = category.trim();
    }

    if (price !== undefined) {
      if (
        price === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0
      ) {
        return res.status(400).json({ message: "Enter a valid price." });
      }

      product.price = Number(price);
    }

    const featuredValue = parseBoolean(isFeatured, product.isFeatured);
    const publishedValue = parseBoolean(isPublished, product.isPublished);

    if (featuredValue === null || publishedValue === null) {
      return res.status(400).json({
        message: "Invalid featured or published setting.",
      });
    }

    product.isFeatured = featuredValue;
    product.isPublished = publishedValue;

    const oldPublicIds = getAllPublicIds(product);

    if (files.length > 0) {
      for (const file of files) {
        const result = await uploadImage(file.buffer);
        newImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }

      product.images = newImages;
      product.imageUrl = newImages[0].url;
      product.imagePublicId = newImages[0].publicId;
    }

    await product.save();
    savedSuccessfully = true;

    // Only remove old images after MongoDB saves the replacement successfully.
    if (newImages.length > 0) {
      await removeImages(
        oldPublicIds.filter(
          (id) => !newImages.some((image) => image.publicId === id)
        )
      );
    }

    return res.json({
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    if (!savedSuccessfully) {
      await removeImages(newImages.map((image) => image.publicId));
    }

    console.error("Update product failed:", error.message);
    return res.status(500).json({ message: "Unable to update product." });
  }
};

// Admin: delete furniture and every associated Cloudinary image
exports.deleteProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const publicIds = getAllPublicIds(product);

    await product.deleteOne();
    await removeImages(publicIds);

    return res.json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Delete product failed:", error.message);
    return res.status(500).json({ message: "Unable to delete product." });
  }
};
