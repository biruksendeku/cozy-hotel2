const Order = require('../models/Order');

// Helper: Calculate percentage safely
const calculatePercentage = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Get all dashboard stats at once
const getDashboardStats = async (req, res) => {
  try {
    // Run all calculations in parallel for speed
    const [dailyStats, weeklyStats, monthlyStats] = await Promise.all([
      calculateDailyStats(),
      calculateWeeklyStats(),
      calculateMonthlyStats()
    ]);

    res.json({
      success: true,
      data: {
        daily: dailyStats,
        weekly: weeklyStats,
        monthly: monthlyStats
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// DAILY: Compare today vs yesterday
const calculateDailyStats = async () => {
  const now = new Date();
  
  // TODAY (midnight to now)
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  const todayCount = await Order.countDocuments({
    createdAt: { $gte: todayStart }
  });

  // YESTERDAY (full day)
  const yesterdayStart = new Date(now);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);

  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const yesterdayCount = await Order.countDocuments({
    createdAt: { 
      $gte: yesterdayStart,
      $lte: yesterdayEnd
    }
  });

  const percentageChange = calculatePercentage(todayCount, yesterdayCount);

  return {
    count: todayCount,
    previousCount: yesterdayCount,
    percentageChange: percentageChange.toFixed(2), // Keep 2 decimal places
    isIncrease: percentageChange >= 0,
    label: "vs Yesterday"
  };
};

// WEEKLY: Compare this week vs last week
const calculateWeeklyStats = async () => {
  const now = new Date();
  
  // THIS WEEK (Sunday to now)
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay()); // Go back to Sunday
  startOfThisWeek.setHours(0, 0, 0, 0);

  const thisWeekCount = await Order.countDocuments({
    createdAt: { $gte: startOfThisWeek }
  });

  // LAST WEEK (full week)
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
  endOfLastWeek.setHours(23, 59, 59, 999);

  const lastWeekCount = await Order.countDocuments({
    createdAt: {
      $gte: startOfLastWeek,
      $lte: endOfLastWeek
    }
  });

  const percentageChange = calculatePercentage(thisWeekCount, lastWeekCount);

  return {
    count: thisWeekCount,
    previousCount: lastWeekCount,
    percentageChange: percentageChange.toFixed(2),
    isIncrease: percentageChange >= 0,
    label: "vs Last Week"
  };
};

// MONTHLY: Compare this month vs last month
const calculateMonthlyStats = async () => {
  const now = new Date();
  
  // THIS MONTH (1st to now)
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const thisMonthCount = await Order.countDocuments({
    createdAt: { $gte: startOfThisMonth }
  });

  // LAST MONTH (full month)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const lastMonthCount = await Order.countDocuments({
    createdAt: {
      $gte: startOfLastMonth,
      $lte: endOfLastMonth
    }
  });

  const percentageChange = calculatePercentage(thisMonthCount, lastMonthCount);

  return {
    count: thisMonthCount,
    previousCount: lastMonthCount,
    percentageChange: percentageChange.toFixed(2),
    isIncrease: percentageChange >= 0,
    label: "vs Last Month"
  };
};

// Export just one main function
module.exports = { getDashboardStats };
