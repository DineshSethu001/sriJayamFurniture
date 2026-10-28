
const mongoose = require("mongoose");
const HomepageSlide = require("../models/HomepageSlide");
const cloudinary = require("../config/cloudinary");

function uploadImage(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "sri-jayam-furnitures/homepage",
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
    console.error("Slider image cleanup failed:", error.message);
  }
}

function parseBoolean(value) {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
}

// Public: only active slides, in configured order.
exports.getPublicSlides = async (req, res) => {
  try {
    const slides = await HomepageSlide.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .limit(8)
      .select("title description buttonText imageUrl order")
      .lean();

    res.json({ slides });
  } catch (error) {
    console.error("Get homepage slides failed:", error.message);
    res.status(500).json({ message: "Unable to load homepage slides." });
  }
};

// Admin: active and inactive slides.
exports.getAdminSlides = async (req, res) => {
  try {
    const slides = await HomepageSlide.find()
      .sort({ order: 1, createdAt: 1 })
      .limit(8)
      .lean();

    res.json({ slides });
  } catch (error) {
    console.error("Get admin slides failed:", error.message);
    res.status(500).json({ message: "Unable to load homepage slides." });
  }
};

// Admin: upload a new slide.
exports.createSlide = async (req, res) => {
  let uploadedImage;

  try {
    const { title, description, buttonText, order, isActive } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please select a banner image." });
    }

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Slide title is required." });
    }

    const parsedOrder = order === undefined || order === ""
      ? 0
      : Number(order);

    const parsedActive = isActive === undefined
      ? true
      : parseBoolean(isActive);

    if (!Number.isInteger(parsedOrder) || parsedOrder < 0 || parsedActive === null) {
      return res.status(400).json({ message: "Invalid slide order or active setting." });
    }

    uploadedImage = await uploadImage(req.file.buffer);

    const slide = await HomepageSlide.create({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      buttonText: typeof buttonText === "string" && buttonText.trim()
        ? buttonText.trim()
        : "Explore Our Collection",
      imageUrl: uploadedImage.secure_url,
      imagePublicId: uploadedImage.public_id,
      order: parsedOrder,
      isActive: parsedActive,
    });

    res.status(201).json({
      message: "Homepage slide added successfully.",
      slide,
    });
  } catch (error) {
    if (uploadedImage?.public_id) {
      await removeImage(uploadedImage.public_id);
    }

    console.error("Create homepage slide failed:", error.message);
    res.status(500).json({ message: "Unable to create homepage slide." });
  }
};

// Admin: edit slide details; image replacement is optional.
exports.updateSlide = async (req, res) => {
  let newImage;
  let saved = false;

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid slide ID." });
    }

    const slide = await HomepageSlide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({ message: "Homepage slide not found." });
    }

    const { title, description, buttonText, order, isActive } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "Slide title is required." });
      }
      slide.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({ message: "Invalid slide description." });
      }
      slide.description = description.trim();
    }

    if (buttonText !== undefined) {
      if (typeof buttonText !== "string") {
        return res.status(400).json({ message: "Invalid button text." });
      }
      slide.buttonText = buttonText.trim();
    }

    if (order !== undefined) {
      const parsedOrder = Number(order);
      if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
        return res.status(400).json({ message: "Order must be a non-negative integer." });
      }
      slide.order = parsedOrder;
    }

    if (isActive !== undefined) {
      const parsedActive = parseBoolean(isActive);
      if (parsedActive === null) {
        return res.status(400).json({ message: "Invalid active setting." });
      }
      slide.isActive = parsedActive;
    }

    if (req.file) {
      newImage = await uploadImage(req.file.buffer);
      slide.imageUrl = newImage.secure_url;
      slide.imagePublicId = newImage.public_id;
    }

    await slide.save();
    saved = true;

    if (newImage) {
      await removeImage(
        newImage.public_id === slide.imagePublicId ? null : slide.imagePublicId
      );
    }

    res.json({ message: "Homepage slide updated successfully.", slide });
  } catch (error) {
    if (!saved && newImage?.public_id) {
      await removeImage(newImage.public_id);
    }

    console.error("Update homepage slide failed:", error.message);
    res.status(500).json({ message: "Unable to update homepage slide." });
  }
};

// Admin: delete slide and its Cloudinary image.
exports.deleteSlide = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid slide ID." });
    }

    const slide = await HomepageSlide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({ message: "Homepage slide not found." });
    }

    const publicId = slide.imagePublicId;
    await slide.deleteOne();
    await removeImage(publicId);

    res.json({ message: "Homepage slide deleted successfully." });
  } catch (error) {
    console.error("Delete homepage slide failed:", error.message);
    res.status(500).json({ message: "Unable to delete homepage slide." });
  }
};
