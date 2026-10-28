
const mongoose = require("mongoose");

const homepageSlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    buttonText: {
      type: String,
      default: "Explore Our Collection",
      trim: true,
      maxlength: 60,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    imagePublicId: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

homepageSlideSchema.index({ isActive: 1, order: 1 });

module.exports =
  mongoose.models.HomepageSlide ||
  mongoose.model("HomepageSlide", homepageSlideSchema);
