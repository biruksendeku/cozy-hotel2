const { body } = require("express-validator");

const foodController = require("../controllers/food");
const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/login");
  }
  next();
};

module.exports = function foodRoutes() {
  const router = require("express").Router();

  router.get("/", isLoggedIn, foodController.listFoods);
  router.post("/add-to-cart", foodController.addToCart);
  router.get("/cart", foodController.renderCart);
  router.post(
    "/update-cart/:id",
    [
      body("quantity")
        .trim()
        .escape()
        .isNumeric()
        .withMessage("Quantity must be Number"),
    ],
    foodController.updateCart,
  );
  router.post("/remove-from-cart/:id", foodController.removeFromCart);
  router.post("/checkout", foodController.checkout);
  router.get("/search-foods", foodController.searchFoods);
  router.get("/user-guide", foodController.renderUserGuide);

  return router;
};
