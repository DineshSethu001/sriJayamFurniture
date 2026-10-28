
const express = require("express");
const {
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
} = require("../controllers/authController");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/me", adminAuth, getCurrentAdmin);

module.exports = router;
