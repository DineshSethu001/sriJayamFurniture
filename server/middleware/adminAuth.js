
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

module.exports = async function adminAuth(req, res, next) {
  try {
    const token = req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({
        message: "Please log in as an administrator",
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "electro-store",
    });

    if (payload.role !== "admin" || typeof payload.sub !== "string") {
      return res.status(403).json({ message: "Access denied" });
    }

    const admin = await Admin.findById(payload.sub);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({
      message: "Session expired or invalid. Please log in again.",
    });
  }
};
