const { body } = require("express-validator");
const adminController = require("../controllers/admin");

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/login");
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).send("Forbidden");
  }
  next();
};

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  },
});

module.exports = function adminRoutes() {
  const router = require("express").Router();

  router.get("/admin", isLoggedIn, isAdmin, adminController.renderDashboard);
  router.get(
    "/admin/foods",
    isLoggedIn,
    isAdmin,
    adminController.listFoods,
  );
  router.get(
    "/admin/orders",
    isLoggedIn,
    isAdmin,
    adminController.listOrders,
  );
  router.get(
    "/admin/revenue",
    isLoggedIn,
    isAdmin,
    adminController.renderRevenue,
  );
  router.get(
    "/admin/create",
    isLoggedIn,
    isAdmin,
    adminController.renderCreateFood,
  );
  router.post(
    "/admin/create",
    upload.single("image"),
    [
      body("name")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Food Name is required")
        .isString()
        .withMessage("Food Name must be String"),
      body("price")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Food Price is required")
        .isNumeric()
        .withMessage("Food Price must be Number"),
      body("calorie")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Food Calorie is required")
        .isNumeric()
        .withMessage("Food Calorie must be Number"),
      body("category")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Food Category is required")
        .isString()
        .withMessage("Food Category must be String"),
      body("preparationTime")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Food Preparation Time is required"),
      body("foodInfo")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Food Information is required")
        .isString()
        .withMessage("Food Information must be String"),
      body("rating")
        .if(body("rating").exists())
        .trim()
        .escape()
        .isNumeric()
        .withMessage("Food Rating must be Number"),
    ],
    isLoggedIn,
    isAdmin,
    adminController.createFood,
  );
  router.get(
    "/admin/edit/:id",
    isLoggedIn,
    isAdmin,
    adminController.renderEditFood,
  );
  router.post(
    "/admin/edit/:id",
    upload.single("image"),
    /*[
    	body('name')
    	.if(body('name').exists())
    	.trim()
    	.escape()
    	.isString()
    	.withMessage('Food Name must be String'),
  		body('price')
  		.if(body('price').exists())
    	.trim()
    	.escape()
    	.isNumeric()
    	.withMessage('Food Price must be Number'),
    	body('calorie')
    	.if(body('calorie').exists())
    	.trim()
    	.escape()
    	.isNumeric()
    	.withMessage('Food Calorie must be Number'),
    	body('category')
    	.if(body('category').exists())
    	.trim()
    	.escape()
    	.isString()
    	.withMessage('Food Category must be String'),
    	body('preparationTime')
    	.if(body('preparationTime').exists())
    	.trim()
    	.escape(),
    	body('foodInfo')
    	.if(body('foodInfo').exists())
    	.trim()
    	.escape()
    	.isString()
    	.withMessage('Food Information must be String'),
    	body('rating')
    	.if(body('rating').exists())
    	.trim()
    	.escape()
    	.isNumeric()
    	.withMessage('Food Rating must be Number'),
    	
    ],*/
    isLoggedIn,
    isAdmin,
    adminController.updateFood,
  );
  router.post(
    "/admin/delete/:id",
    isLoggedIn,
    isAdmin,
    adminController.deleteFood,
  );

  return router;
};
