
require("dotenv").config();
const homepageSliderRoutes = require("./routes/homepageSliderRoutes");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Existing admin authentication
app.use("/api/admin/auth", authRoutes);
app.use("/api/homepage-slides", homepageSliderRoutes);


// Furniture products: public listing + protected admin operations
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("Configure a strong JWT_SECRET in .env");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Configure MONGODB_URI in .env");
  }

  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
