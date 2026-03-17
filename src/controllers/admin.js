const { validationResult } = require("express-validator");

const Food = require("../models/food");
const Order = require("../models/order");
const User = require("../models/user");
const cloudinary = require("../config/cloudinary");

function calculatePercentage(currentData, previousData) {
  if (previousData === 0) return 0;
  const percentage = ((currentData - previousData) / previousData) * 100;
  return percentage;
}

async function renderDashboard(req, res, next) {
  try {
    const totalCustomers = await User.countDocuments({});
    const totalDishes = await Food.countDocuments({});
    const allPendingOrders = await Order.find({ status: "pending" }).sort({
      createdAt: 1,
    });
    const allCancelledOrders = await Order.find({ status: "cancelled" }).sort({
      createdAt: -1,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const todayOrders = await Order.countDocuments({
      status: "completed",
      createdAt: { $gte: today },
    });
    const yesterdayOrders = await Order.countDocuments({
      status: "completed",
      createdAt: { $gte: yesterday, $lte: yesterdayEnd },
    });
    const todayRevenue = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: today },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const yesterdayRevenue = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: yesterday, $lte: yesterdayEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    const todayRev = todayRevenue[0]?.total || 0;
    const yesterdayRev = yesterdayRevenue[0]?.total || 0;
    const dailyOrderChange = calculatePercentage(todayOrders, yesterdayOrders);
    const dailyRevChange = calculatePercentage(todayRev, yesterdayRev);
    const topFoods = await Order.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.foodId",
          count: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.price" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "foods",
          localField: "_id",
          foreignField: "_id",
          as: "foodDetails",
        },
      },
      { $unwind: "$foodDetails" },
    ]);

    res.render("admin/dashboard", {
      orders: {
        today: todayOrders,
        yesterday: yesterdayOrders,
        dailyChange: dailyOrderChange,
        isIncrease: dailyOrderChange >= 0,
        pending: allPendingOrders,
        cancelled: allCancelledOrders,
      },
      revenue: {
        today: todayRev,
        yesterday: yesterdayRev,
        dailyChange: dailyRevChange,
        isIncrease: dailyRevChange >= 0,
        allTime: totalRevenue[0]?.totalRevenue || 0,
      },
      topFoods: topFoods,
      totalDishes: totalDishes,
      totalCustomers: totalCustomers,
    });
  } catch (err) {
    next(err);
  }
}

async function listFoods(req, res, next) {
  try {
    const totalFoods = await Food.countDocuments();
    const activeDishes = await Food.countDocuments({ status: "active" });
    const popularDishes = await Food.countDocuments({ category: "popular" });
    const searchName = req.query.name || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const buildSearchQuery = (name) => {
      if (!name || name.trim() === "") return {};
      return {
        name: {
          $regex: name.trim(),
          $options: "i",
        },
      };
    };
    const filter = buildSearchQuery(searchName);
    const foods = await Food.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const totalPages = Math.ceil(totalFoods / limit);
    const ratings = await Food.find({}, "rating");
    const totalRating = ratings.reduce(
      (sum, food) => sum + (food.rating || 0),
      0,
    );
    const averageRating = totalRating / totalFoods;

    res.render("admin/foods", {
      foods: foods,
      totalFoods: totalFoods,
      activeDishes: activeDishes,
      popularDishes: popularDishes,
      averageRating: averageRating || 0,
      currentPage: page,
      totalPages: totalPages,
      searchName: searchName,
    });
  } catch (err) {
    next(err);
  }
}

async function listOrders(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || "";
    const sortBy = req.query.sort || "newest";
    const statusFilter = req.query.status || "";

    let filter = {};
    if (statusFilter) filter.status = statusFilter;

    let sort = {};
    if (sortBy === "newest") sort = { createdAt: -1 };
    else if (sortBy === "oldest") sort = { createdAt: 1 };
    else if (sortBy === "price_high") sort = { totalAmount: -1 };
    else if (sortBy === "price_low") sort = { totalAmount: 1 };

    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const todayOrders = await Order.countDocuments({
      status: "completed",
      createdAt: { $gte: today },
    });
    const yesterdayOrders = await Order.countDocuments({
      status: "completed",
      createdAt: { $gte: yesterday, $lte: yesterdayEnd },
    });

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    lastWeekEnd.setHours(23, 59, 59, 999);
    const thisWeekOrders = await Order.countDocuments({
      status: "completed",
      createdAt: { $gte: weekStart },
    });
    const lastWeekOrders = await Order.countDocuments({
      status: "completed",
      createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd },
    });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );
    const thisMonthOrders = await Order.countDocuments({
      status: "completed",
      createdAt: { $gte: monthStart },
    });
    const lastMonthOrders = await Order.countDocuments({
      status: "completed",
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });

    const yearStart = new Date();
    yearStart.setMonth(0, 1);
    yearStart.setHours(0, 0, 0, 0);
    const lastYearStart = new Date();
    lastYearStart.setFullYear(lastYearStart.getFullYear() - 1, 0, 1);
    lastYearStart.setHours(0, 0, 0, 0);
    const lastYearEnd = new Date();
    lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1, 11, 31);
    lastYearEnd.setHours(23, 59, 59, 999);
    const thisYearOrders = await Order.countDocuments({
      status: "completed",
      createdAt: { $gte: yearStart },
    });
    const lastYearOrders = await Order.countDocuments({
      status: "completed",
      createdAt: { $gte: lastYearStart, $lte: lastYearEnd },
    });
    const allTimeOrders = await Order.countDocuments({ status: "completed" });

    const statusCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statusStats = {};
    statusCounts.forEach((item) => (statusStats[item._id] = item.count));

    res.render("admin/orders", {
      orders,
      currentPage: page,
      totalPages,
      searchQuery,
      sortBy,
      statusFilter,
      orderAnalytics: {
        daily: {
          today: todayOrders,
          yesterday: yesterdayOrders,
          change: calculatePercentage(todayOrders, yesterdayOrders),
          isIncrease: calculatePercentage(todayOrders, yesterdayOrders) >= 0,
        },
        weekly: {
          thisWeek: thisWeekOrders,
          lastWeek: lastWeekOrders,
          change: calculatePercentage(thisWeekOrders, lastWeekOrders),
          isIncrease: calculatePercentage(thisWeekOrders, lastWeekOrders) >= 0,
        },
        monthly: {
          thisMonth: thisMonthOrders,
          lastMonth: lastMonthOrders,
          change: calculatePercentage(thisMonthOrders, lastMonthOrders),
          isIncrease:
            calculatePercentage(thisMonthOrders, lastMonthOrders) >= 0,
        },
        yearly: {
          thisYear: thisYearOrders,
          lastYear: lastYearOrders,
          change: calculatePercentage(thisYearOrders, lastYearOrders),
          isIncrease: calculatePercentage(thisYearOrders, lastYearOrders) >= 0,
        },
        allTime: allTimeOrders,
        byStatus: {
          pending: statusStats["pending"] || 0,
          processing: statusStats["processing"] || 0,
          completed: statusStats["completed"] || 0,
          cancelled: statusStats["cancelled"] || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error loading orders:", error);
    res.status(500).render("error", { error: "Failed to load orders" });
  }
}

async function renderRevenue(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const todayRevenue = await Order.aggregate([
      { $match: { status: "completed", createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const yesterdayRevenue = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: yesterday, $lte: yesterdayEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    lastWeekEnd.setHours(23, 59, 59, 999);
    const thisWeekRevenue = await Order.aggregate([
      { $match: { status: "completed", createdAt: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const lastWeekRevenue = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );
    const thisMonthRevenue = await Order.aggregate([
      { $match: { status: "completed", createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const yearStart = new Date();
    yearStart.setMonth(0, 1);
    yearStart.setHours(0, 0, 0, 0);
    const lastYearStart = new Date();
    lastYearStart.setFullYear(lastYearStart.getFullYear() - 1, 0, 1);
    lastYearStart.setHours(0, 0, 0, 0);
    const lastYearEnd = new Date();
    lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1, 11, 31);
    lastYearEnd.setHours(23, 59, 59, 999);
    const thisYearRevenue = await Order.aggregate([
      { $match: { status: "completed", createdAt: { $gte: yearStart } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const lastYearRevenue = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: lastYearStart, $lte: lastYearEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const allTimeRevenue = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    const todayRev = todayRevenue[0]?.total || 0;
    const yesterdayRev = yesterdayRevenue[0]?.total || 0;
    const thisWeekRev = thisWeekRevenue[0]?.total || 0;
    const lastWeekRev = lastWeekRevenue[0]?.total || 0;
    const thisMonthRev = thisMonthRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;
    const thisYearRev = thisYearRevenue[0]?.total || 0;
    const lastYearRev = lastYearRevenue[0]?.total || 0;
    const todayOrders = await Order.countDocuments({
      status: "completed",
      createdAt: { $gte: today },
    });
    const thisWeekOrders = await Order.countDocuments({
      status: "completed",
      createdAt: { $gte: weekStart },
    });
    const thisMonthOrders = await Order.countDocuments({
      status: "completed",
      createdAt: { $gte: monthStart },
    });
    const thisYearOrders = await Order.countDocuments({
      status: "completed",
      createdAt: { $gte: yearStart },
    });

    res.render("admin/revenue", {
      revenueAnalytics: {
        daily: {
          today: todayRev,
          yesterday: yesterdayRev,
          change: calculatePercentage(todayRev, yesterdayRev),
          isIncrease: calculatePercentage(todayRev, yesterdayRev) >= 0,
          orderCount: todayOrders,
        },
        weekly: {
          thisWeek: thisWeekRev,
          lastWeek: lastWeekRev,
          change: calculatePercentage(thisWeekRev, lastWeekRev),
          isIncrease: calculatePercentage(thisWeekRev, lastWeekRev) >= 0,
          orderCount: thisWeekOrders,
        },
        monthly: {
          thisMonth: thisMonthRev,
          lastMonth: lastMonthRev,
          change: calculatePercentage(thisMonthRev, lastMonthRev),
          isIncrease: calculatePercentage(thisMonthRev, lastMonthRev) >= 0,
          orderCount: thisMonthOrders,
        },
        yearly: {
          thisYear: thisYearRev,
          lastYear: lastYearRev,
          change: calculatePercentage(thisYearRev, lastYearRev),
          isIncrease: calculatePercentage(thisYearRev, lastYearRev) >= 0,
          orderCount: thisYearOrders,
        },
        allTime: allTimeRevenue[0]?.totalRevenue || 0,
      },
      period: req.query.period || "daily",
    });
  } catch (err) {
    next(err);
  }
}

async function renderCreateFood(req, res, next) {
  try {
    const foods = await Food.find();
    const totalFoods = await Food.countDocuments();
    const ratings = await Food.find({}, "rating");
    const totalRating = ratings.reduce(
      (sum, food) => sum + (food.rating || 0),
      0,
    );
    const averageRating = totalRating / totalFoods;
    const popularDishes = await Food.countDocuments({ category: "popular" });

    res.render("admin/create", {
      foods: foods,
      totalFoods: totalFoods,
      averageRating: averageRating,
      popularDishes: popularDishes,
    });
  } catch (err) {
    next(err);
  }
}

async function createFood(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errMsg = errors.array().map((error) => error.msg);
      req.flash("error", errMsg);
      return res.redirect("/admin/create#create");
    }

    const {
      name,
      price,
      calorie,
      category,
      preparationTime,
      foodInfo,
      rating,
    } = req.body;
    if (
      !name ||
      !price ||
      !calorie ||
      !category ||
      !preparationTime ||
      !foodInfo
    ) {
      return req.flash("error", "Missing Important Food Metadata");
    }
    if (!req.file) {
      req.flash("error", "Food Image is required");
      return res.redirect("/admin/create#create");
    }

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "restaurant-app" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );
        stream.end(req.file.buffer);
      });
    const result = await streamUpload();
    const imageUrl = result.secure_url;
    const imagePublicId = result.public_id;
    const newFood = new Food({
      name,
      price,
      imageUrl,
      imagePublicId,
      foodInfo,
      calorie,
      category,
      preparationTime,
      rating,
    });
    await newFood.save();
    res.redirect("/admin/foods#foods");
  } catch (err) {
    next(err);
  }
}

async function renderEditFood(req, res, next) {
  try {
    const id = req.params.id.toString().trim();
    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).send("Food Item Not Found");
    }
    res.render("admin/edit", {
      food: food,
    });
  } catch (err) {
    next(err);
  }
}

async function updateFood(req, res, next) {
  try {
    const id = req.params.id.toString().trim();
    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).send("Food Item Not Found");
    }
    const pastImagePublicId = food.imagePublicId;

    if (req.body.name && req.body.name.trim() !== "") {
      food.name = req.body.name.trim();
    } else {
      food.name = food.name;
    }
    if (
      req.body.price &&
      req.body.price.trim() !== "" &&
      typeof (req.body.price.trim() === "number")
    ) {
      food.price = req.body.price.trim();
    } else {
      food.price = food.price;
    }
    if (
      req.body.calorie &&
      req.body.calorie.trim() !== "" &&
      typeof (req.body.calorie.trim() === "number")
    ) {
      food.calorie = req.body.calorie.trim();
    } else {
      food.calorie = food.calorie;
    }
    if (
      req.body.category &&
      req.body.category.trim() !== "" &&
      typeof (req.body.category.trim() === "string")
    ) {
      food.category = req.body.category.trim();
    } else {
      food.category = food.category;
    }
    if (
      req.body.preparationTime &&
      req.body.preparationTime.trim() !== "" &&
      typeof (req.body.preparationTime === "string")
    ) {
      food.preparationTime = req.body.preparationTime;
    } else {
      food.preparationTime = food.preparationTime;
    }
    if (
      req.body.foodInfo &&
      req.body.foodInfo.trim() !== "" &&
      typeof (req.body.foodInfo.trim() === "string")
    ) {
      food.foodInfo = req.body.foodInfo.trim();
    } else {
      food.foodInfo = food.foodInfo;
    }
    if (
      req.body.rating &&
      req.body.rating.trim() !== "" &&
      typeof (req.body.rating.trim() === "number")
    ) {
      food.rating = req.body.rating.trim();
    } else {
      food.rating = food.rating;
    }

    if (req.file) {
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "restaurant-app" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            },
          );
          stream.end(req.file.buffer);
        });
      const result = await streamUpload();
      food.imageUrl = result.secure_url;
      food.imagePublicId = result.public_id;
    }
    await food.save();

    let deleteResult;
    if (req.file) {
      deleteResult = await cloudinary.uploader.destroy(pastImagePublicId);
    }
    if (deleteResult.result === "ok") {
      console.log(`The previous image of food item: ${food.name} is Deleted!`);
    } else {
      console.log(
        `Failed to Delete the image of food item: ${food.name}, Manually Delete it on cluodinary`,
      );
    }

    res.redirect("/admin/foods#foods");
  } catch (err) {
    next(err);
  }
}

async function deleteFood(req, res, next) {
  try {
    const id = req.params.id.toString().trim();
    const food = await Food.findById(id);
    if (!food) {
      return res.status(400).send(`
            	<h1> Food Item Not Found. </h1>
            	<p> Couldn't find the requested food item! </p>
            	<a href="/admin/foods#foods"> Go Back </a>
            	`);
    }

    await Food.findByIdAndDelete(id);
    res.redirect("/admin/foods#foods");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  renderDashboard,
  listFoods,
  listOrders,
  renderRevenue,
  renderCreateFood,
  createFood,
  renderEditFood,
  updateFood,
  deleteFood,
};
