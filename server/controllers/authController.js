
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

function setAuthCookie(res, token) {
  res.cookie("adminToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 1000,
  });
}

exports.loginAdmin = async (req, res) => {
  try {
    const email = req.body?.email?.trim().toLowerCase();
    const password = req.body?.password;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email ||
      !password ||
      email.length > 254 ||
      password.length > 128
    ) {
      return res.status(400).json({
        message: "Valid email and password are required",
      });
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (
      !admin ||
      !(await bcrypt.compare(password, admin.password))
    ) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { sub: admin._id.toString(), role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h", issuer: "electro-store" }
    );

    setAuthCookie(res, token);

    return res.status(200).json({
      message: "Login successful",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);
    return res.status(500).json({
      message: "Unable to process login",
    });
  }
};

exports.logoutAdmin = (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

exports.getCurrentAdmin = async (req, res) => {
  return res.status(200).json({
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
    },
  });
};
