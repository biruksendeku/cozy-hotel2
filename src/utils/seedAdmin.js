require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user");

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !adminEmail.trim()) {
    throw new Error("ADMIN_EMAIL must be set to an existing account email");
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI must be set");
  }

  try {
    await mongoose.connect(mongoUri);
    const user = await User.findOneAndUpdate(
      { email: adminEmail.trim().toLowerCase() },
      { $set: { isAdmin: true } },
      { new: true },
    );

    if (!user) {
      throw new Error(`No account found for ADMIN_EMAIL: ${adminEmail.trim()}`);
    }

    console.log(`Admin privileges granted to ${user.email}`);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedAdmin().catch((error) => {
    console.error("Failed to seed admin:", error);
    process.exitCode = 1;
  });
}

module.exports = seedAdmin;
