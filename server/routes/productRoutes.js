
const express = require("express");
const multer = require("multer");
const adminAuth = require("../middleware/adminAuth");

const {
  getProducts,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8,
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

const imageFields = upload.fields([
  { name: "images", maxCount: 8 },
  { name: "image", maxCount: 1 },
]);

router.get("/", getProducts);
router.get("/admin/all", adminAuth, getAdminProducts);

router.post("/", adminAuth, imageFields, createProduct);
router.patch("/:id", adminAuth, imageFields, updateProduct);
router.delete("/:id", adminAuth, deleteProduct);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Each image must be 5 MB or smaller."
        : err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE"
          ? "Upload up to 8 images using the images field."
          : "Unable to process the uploaded images.";

    return res.status(400).json({ message });
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
});

module.exports = router;
