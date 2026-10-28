
const express = require("express");
const multer = require("multer");
const adminAuth = require("../middleware/adminAuth");

const {
  getPublicSlides,
  getAdminSlides,
  createSlide,
  updateSlide,
  deleteSlide,
} = require("../controllers/homepageSliderController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only JPG, PNG, and WebP images are allowed.")
      );
    }

    callback(null, true);
  },
});

router.get("/", getPublicSlides);
router.get("/admin/all", adminAuth, getAdminSlides);
router.post("/", adminAuth, upload.single("image"), createSlide);
router.patch("/:id", adminAuth, upload.single("image"), updateSlide);
router.delete("/:id", adminAuth, deleteSlide);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Banner image must be 5 MB or smaller."
          : "Unable to process the banner image.",
    });
  }

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
});

module.exports = router;
