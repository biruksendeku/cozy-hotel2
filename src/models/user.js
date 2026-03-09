const mongoose = require("mongoose");
const { isEmail } = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name field  required"],
    },
    email: {
      type: String,
      required: [true, "Email field required"],
      index: true,
      sparse: true, // incase null happens
      lowercase: true,
      validate: [isEmail, "Invalid email address"],
    },
    avatar: String,
    password: {
      type: String,
      default: null,
    },
    newPassword: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false, // add true for non-local strategies
    },
    isAdmin: {
      type: Boolean,
      default: true, // for the time being
    },
    cart: {
      type: Array,
      default: [],
    },
    wishlist: {
      type: Array,
      default: [],
    },
    conversations: {
      type: Array,
      default: [],
    },
    authProvider: {
      type: Array,
      default: [],
    },
    googleId: String,
    facebookId: String,
    verificationToken: String,
    verificationDate: Date,
    resetToken: String,
    resetDate: Date,
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
