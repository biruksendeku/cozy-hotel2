const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const Food = require("../models/food");
const Order = require("../models/order");
const BadRequestError = require("../middlewares/errors/badRequestError");
const NotFoundError = require("../middlewares/errors/notFoundError");
let { MAX_ITEM_QUANTITY } = process.env;
MAX_ITEM_QUANTITY = parseInt(MAX_ITEM_QUANTITY);

async function listFoods(req, res, next) {
  try {
    const foods = await Food.find();
    res.render("home", {
      foods,
      title: "Hotel Transylvania | Home Page",
      tagline: "Warm Welcome Guests!",
    });
  } catch (err) {
    next(err);
  }
}

async function addToCart(req, res, next) {
  try {
    const foodId = req.body && req.body.foodId;
    if (typeof foodId !== "string" || !foodId.trim()) {
      throw new BadRequestError("Food ID is required");
    }

    const id = foodId.trim();
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestError("Invalid food ID");
    }

    const food = await Food.findById(id);
    if (!food) {
      return res.json({ success: false, message: "Out of stock" });
      throw new NotFoundError("Item");
    }

    const existingFood = req.session.cart.find((item) => item.id === id);
    if (existingFood) {
      if (existingFood.quantity >= MAX_ITEM_QUANTITY) {
        return res.json({
          success: false,
          message: `You can add up to ${MAX_ITEM_QUANTITY} of this item`,
        });
      }
      existingFood.quantity += 1;
    } else {
      req.session.cart.push({
        id: food.id,
        name: food.name,
        price: food.price,
        quantity: 1,
        imageUrl: food.imageUrl,
      });
    }

    res.json({
      success: true,
      cartCount: req.session.cart.length,
      message: "Item added to cart",
    });
  } catch (err) {
    next(err);
  }
}

function renderCart(req, res, next) {
  try {
    const cart = req.session.cart;
    const total = cart.reduce(
      (sum, food) => sum + food.price * food.quantity,
      0,
    );
    res.render("cart", {
      cart,
      total: total.toFixed(2),
      title: "Hotel Transylvania | Warm Welcome",
    });
  } catch (err) {
    next(err);
  }
}

function updateCart(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash(
        "error",
        errors.array().map((error) => error.msg),
      );
      return res.redirect("/cart");
    }

    const id = req.params.id.trim();
    const quantity = parseInt(req.body.quantity.trim(), 10);
    const food = req.session.cart.find((item) => item.id === id);
    if (food) {
      if (quantity <= 0) {
        req.session.cart = req.session.cart.filter((item) => item.id !== id);
      } else if (quantity > MAX_ITEM_QUANTITY) {
        req.flash(
          "error",
          `You can add up to ${MAX_ITEM_QUANTITY} of each item`,
        );
        return res.redirect("/cart");
      } else {
        food.quantity = quantity;
      }
    }

    res.redirect("/cart");
  } catch (err) {
    next(err);
  }
}

function removeFromCart(req, res, next) {
  try {
    const id = req.params.id.trim();
    req.session.cart = req.session.cart.filter((item) => item.id !== id);
    res.redirect("/cart");
  } catch (err) {
    next(err);
  }
}

async function checkout(req, res, next) {
  try {
    const cart = req.session.cart || [];
    if (cart.length === 0) {
      return res.send("Empty cart");
    }
    const orders = cart.map((item) => ({
      foodId: item.id,
      orderedBy: req.user._id,
      totalAmount: item.price * item.quantity,
      itemCount: item.quantity,
    }));

    await Order.insertMany(orders);

    req.session.cart = [];
    res.render("success", { message: "Order placed successfully!" });
  } catch (err) {
    next(err);
  }
}

async function searchFoods(req, res, next) {
  try {
    let searchName = req.query.name || "";
    searchName = searchName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filter = searchName.trim()
      ? { name: { $regex: searchName.trim(), $options: "i" } }
      : {};
    const foods = await Food.find(filter).sort({ createdAt: -1 }).lean();
    res.json(foods);
  } catch (err) {
    next(err);
  }
}

function renderUserGuide(req, res) {
  res.render("user-guide", {
    title: "User Guide - Hotel Transylvania",
    cart: req.session.cart || [],
    user: req.user || null,
  });
}

module.exports = {
  listFoods,
  addToCart,
  renderCart,
  updateCart,
  removeFromCart,
  checkout,
  searchFoods,
  renderUserGuide,
};
