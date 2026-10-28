
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function changePassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = (
      await ask("Enter admin email: ")
    ).trim().toLowerCase();

    const newPassword = await ask("Enter new admin password: ");

    if (newPassword.length < 12 || newPassword.length > 128) {
      throw new Error("Password must be 12–128 characters long.");
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      throw new Error("Admin account not found.");
    }

    admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();

    console.log("Admin password changed successfully!");
  } catch (error) {
    console.error("Password change failed:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
}

changePassword();
