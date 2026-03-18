const mongoose = require("mongoose");

// Add to your Order model (models/Order.js)
const orderSchema = new mongoose.Schema(
  {
    foodId: {
      type: String,
      required: [true, "Food ID is required"],
    },
    orderId: {
      type: String,
      default: () => new mongoose.Types.ObjectId(),
    },
    orderedBy: {
      type: String,
      required: [true, "User ID is required"],
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    itemCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
