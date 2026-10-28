
const mongoose = require("mongoose");

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
    },

    // Legacy fields: retained for existing products and components.
    imageUrl: {
      type: String,
      required: [true, "Product image URL is required"],
      trim: true,
    },
    imagePublicId: {
      type: String,
      required: [true, "Cloudinary image ID is required"],
      trim: true,
    },

    // New field: supports multiple product images.
    images: {
      type: [productImageSchema],
      default: [],
      validate: {
        validator: (images) => images.length <= 8,
        message: "A product can have at most 8 images.",
      },
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.index({
  isPublished: 1,
  isFeatured: 1,
  createdAt: -1,
});

module.exports =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);
