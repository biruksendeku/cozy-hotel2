const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const Food = require("../models/food");
const Order = require("../models/order");
const BadRequestError = require("../middlewares/errors/badRequestError");

async function listFoods(req, res, next) {
  try {
    const foods = await Food.find();
    res.render("home", {
      foods,
      title: " Hotel Transylvania | Home Page ",
      tagline: " Warm Welcome Guests! ",
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
    }

    const existingFood = req.session.cart.find((item) => item.id === id);
    if (existingFood) {
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
    for (const item of cart) {
      await Order.create({
        foodId: item.id,
        orderedBy: req.user._id,
        totalAmount: item.price * item.quantity,
        itemCount: item.quantity,
      });
    }

    req.session.cart = [];
    res.render("success", { message: "Order placed successfully!" });
  } catch (err) {
    next(err);
  }
}

async function searchFoods(req, res, next) {
  try {
    const searchName = req.query.name || "";
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
