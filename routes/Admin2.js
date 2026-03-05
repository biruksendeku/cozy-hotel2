// const { isLoggedIn, isAdmin } = require('../middlewares/auth');
const Food = require('../models/Food');
const Order = require('../models/Order');

const isLoggedIn = (req, res, next) => {
	if(!req.isAuthenticated()) {
		return res.redirect('/auth/login');
	}
	next();
};

const isAdmin = (req, res, next) => {
	if(!req.user.isAdmin) {
		return res.status(403).send('Forbidden');
	}
	next();
};

function calculatePercentage(currentData, previousData) {
	if(previousData === 0) return 0;
	const percentage = ((currentData - previousData) / previousData) * 100;
	return percentage; // +ve increase, -ve decrease
};

module.exports = function adminRoutes() {

	const router = require('express').Router();

	router.get('/admin', async (req, res, next) => {
		try {
			const allPendingOrders = await Order.find({
				status: 'pending'
			})
			.sort({ createdAt: 1 }); // oldest first = asc

			const allCancelledOrders = await Order.find({
				status: 'cancelled'
			})
			.sort({ createdAt: -1 }); // newest first = desc

			// DAILY DATA ANALYSIS
			const allTimeOrders = await Order.countDocuments({ 
			    status: 'completed' 
			});
			
			const todayOrders = await Order.countDocuments({
				createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
			});
			const yesterdayOrders = await Order.countDocuments({
				createdAt: {
					$gte: new Date(Date.now() - 86400000).setHours(0, 0, 0, 0),
					$lt: new Date().setHours(0, 0, 0, 0)
				}
			});

			// WEEKLY DATA ANALYSIS
			const thisWeekStart = new Date();
			thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
			thisWeekStart.setHours(0, 0, 0, 0);

			const thisWeekOrders = await Order.countDocuments({
				createdAt: { $gte: thisWeekStart }
			});

			const lastWeekStart = new Date(thisWeekStart);
			lastWeekStart.setDate(lastWeekStart.getDate() - 7);

			const lastWeekEnd = new Date(thisWeekStart);
			lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
			lastWeekEnd.setHours(23, 59, 59, 999);

			const lastWeekOrders = await Order.countDocuments({
				createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd }
			});

			// MONTHLY DATA ANALYSIS
			const now = new Date();
			
			const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
			
			const thisMonthOrders = await Order.countDocuments({
				createdAt: { $gte: thisMonthStart }
			});
			
			const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
			const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23,59,59,999);
			
			const lastMonthOrders = await Order.countDocuments({
				createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
			});

			// THIS YEAR (Jan 1 - now)
			const yearStart = new Date();
			yearStart.setMonth(0, 1);
			yearStart.setHours(0, 0, 0, 0);
			
			const thisYearOrders = await Order.countDocuments({ 
			    status: 'completed',
			    createdAt: { $gte: yearStart }
			});
			
			// LAST YEAR (Jan 1 - Dec 31)
			const lastYearStart = new Date();
			lastYearStart.setFullYear(lastYearStart.getFullYear() - 1, 0, 1);
			lastYearStart.setHours(0, 0, 0, 0);
			
			const lastYearEnd = new Date();
			lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1, 11, 31);
			lastYearEnd.setHours(23, 59, 59, 999);
			
			const lastYearOrders = await Order.countDocuments({ 
			    status: 'completed',
			    createdAt: { $gte: lastYearStart, $lte: lastYearEnd }
			});


			// TOTAL REVENUE
			const revenueResult = await Order.aggregate([
				{
					$match: {
						// ...filter,
						status: "completed"
					}
				},
				{
					$group: {
						_id: null,
						totalRevenue: { $sum: "$totalAmount" }
					}
				}
			]);

			// TIMELY REVENUE
			// TODAY
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			
			const todayRevenue = await Order.aggregate([
			    { 
			        $match: { 
			            status: 'completed',
			            createdAt: { $gte: today }
			        } 
			    },
			    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
			]);
			
			// YESTERDAY
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			yesterday.setHours(0, 0, 0, 0);
			
			const yesterdayEnd = new Date(yesterday);
			yesterdayEnd.setHours(23, 59, 59, 999);
			
			const yesterdayRevenue = await Order.aggregate([
			    { 
			        $match: { 
			            status: 'completed',
			            createdAt: { $gte: yesterday, $lte: yesterdayEnd }
			        } 
			    },
			    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
			]);
			
			// THIS WEEK
			const weekStart = new Date();
			weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
			weekStart.setHours(0, 0, 0, 0);
			
			const thisWeekRevenue = await Order.aggregate([
			    { 
			        $match: { 
			            status: 'completed',
			            createdAt: { $gte: weekStart }
			        } 
			    },
			    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
			]);
			
			// LAST WEEK
			const lastWeekStartRev = new Date(weekStart);
			lastWeekStartRev.setDate(lastWeekStartRev.getDate() - 7);
			
			const lastWeekEndRev = new Date(weekStart);
			lastWeekEndRev.setDate(lastWeekEndRev.getDate() - 1);
			lastWeekEndRev.setHours(23, 59, 59, 999);
			
			const lastWeekRevenue = await Order.aggregate([
			    { 
			        $match: { 
			            status: 'completed',
			            createdAt: { $gte: lastWeekStartRev, $lte: lastWeekEndRev }
			        } 
			    },
			    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
			]);
			
			// THIS MONTH
			const monthStart = new Date();
			monthStart.setDate(1);
			monthStart.setHours(0, 0, 0, 0);
			
			const thisMonthRevenue = await Order.aggregate([
			    { 
			        $match: { 
			            status: 'completed',
			            createdAt: { $gte: monthStart }
			        } 
			    },
			    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
			]);
			
			// LAST MONTH
			const lastMonthStartRev = new Date();
			lastMonthStartRev.setMonth(lastMonthStartRev.getMonth() - 1);
			lastMonthStartRev.setDate(1);
			lastMonthStartRev.setHours(0, 0, 0, 0);
			
			const lastMonthEndRev = new Date();
			lastMonthEndRev.setDate(0); // Last day of last month
			lastMonthEndRev.setHours(23, 59, 59, 999);
			
			const lastMonthRevenue = await Order.aggregate([
			    { 
			        $match: { 
			            status: 'completed',
			            createdAt: { $gte: lastMonthStartRev, $lte: lastMonthEndRev }
			        } 
			    },
			    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
			]);
			
			// THIS YEAR
			const yearStartRev = new Date();
			yearStartRev.setMonth(0, 1); // January 1st
			yearStartRev.setHours(0, 0, 0, 0);
			
			const thisYearRevenue = await Order.aggregate([
			    { 
			        $match: { 
			            status: 'completed',
			            createdAt: { $gte: yearStartRev }
			        } 
			    },
			    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
			]);
			
			// LAST YEAR
			const lastYearStartRev = new Date();
			lastYearStartRev.setFullYear(lastYearStartRev.getFullYear() - 1, 0, 1); // Jan 1 last year
			lastYearStartRev.setHours(0, 0, 0, 0);
			
			const lastYearEndRev = new Date();
			lastYearEndRev.setFullYear(lastYearEndRev.getFullYear() - 1, 11, 31); // Dec 31 last year
			lastYearEndRev.setHours(23, 59, 59, 999);
			
			const lastYearRevenue = await Order.aggregate([
			    { 
			        $match: { 
			            status: 'completed',
			            createdAt: { $gte: lastYearStartRev, $lte: lastYearEndRev }
			        } 
			    },
			    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
			]);

			// REVENUE EXTRACTION
			const todayRev = todayRevenue[0]?.total || 0;
			const yesterdayRev = yesterdayRevenue[0]?.total || 0;
			const thisWeekRev = thisWeekRevenue[0]?.total || 0;
			const lastWeekRev = lastWeekRevenue[0]?.total || 0;
			const thisMonthRev = thisMonthRevenue[0]?.total || 0;
			const lastMonthRev = lastMonthRevenue[0]?.total || 0;
			const thisYearRev = thisYearRevenue[0]?.total || 0;
			const lastYearRev = lastYearRevenue[0]?.total || 0;
			
			const dailyOrderChange = calculatePercentage(todayOrders, yesterdayOrders);
			const dailyRevChange = calculatePercentage(todayRev, yesterdayRev);
			
			const weeklyOrderChange = calculatePercentage(thisWeekOrders, lastWeekOrders);
			const weeklyRevChange = calculatePercentage(thisWeekRev, lastWeekRev);
			
			const monthlyOrderChange = calculatePercentage(thisMonthOrders, lastMonthOrders);
			const monthlyRevChange = calculatePercentage(thisMonthRev, lastMonthRev);

			const yearlyOrderChange = calculatePercentage(thisYearOrders, lastYearOrders);
			const yearlyRevChange = calculatePercentage(thisYearRev, lastYearRev);
			
			res.render('admin/dashboard', {
				orders: {
					daily: {
						today: todayOrders,
						yesterday: yesterdayOrders,
						dailyChange: dailyOrderChange,
						isIncrease: dailyOrderChange >= 0 // true increase, false decrease
					},
					weekly: {
						thisWeek: thisWeekOrders,
						lastWeek: lastWeekOrders,
						weeklyChange: weeklyOrderChange,
						isIncrease: weeklyOrderChange >= 0
					},
					monthly: {
						thisMonth: thisMonthOrders,
						lastMonth: lastMonthOrders,
						monthlyChange: monthlyOrderChange,
						isIncrease: monthlyOrderChange >= 0
					},
					yearly: {
						thisYearOrders: thisYearOrders,
						lastYearOrders: lastYearOrders,
						yearlyChange: yearlyOrderChange,
						isIncrease: yearlyOrderChange >= 0
					},
					allTime: allTimeOrders,
					pending: allPendingOrders,
					cancelled: allCancelledOrders
				},
				revenue: {
					daily: {
						today: todayRev,
						yesterday: yesterdayRev,
						dailyChange: dailyRevChange,
						isIncrease: dailyRevChange >= 0
					},
					weekly: {
						thisWeek: thisWeekRev,
						lastWeek: lastWeekRev,
						weeklyChange: weeklyRevChange,
						isIncrease: weeklyRevChange >= 0
					},
					monthly: {
						thisMonth: thisMonthRev,
						lastMonth: lastMonthRev,
						monthlyChange: monthlyRevChange,
						isIncrease: monthlyRevChange >= 0
					},
					yearly: {
						thisYear: thisYearRev,
						lastYear: lastYearRev,
						yearlyChange: yearlyRevChange,
						isIncrease: yearlyRevChange >= 0
					},
					allTime: revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0
				}
			});
			
		} catch(err) {
			next(err);
		}
	});

	router.get('/admin/foods', async (req, res, next) => {
		try {
			// const foods = await Food.find();
			const totalFoods = await Food.countDocuments();
			const activeDishes = await Food.countDocuments({ status: 'active' });
			const popularDishes = await Food.countDocuments({ category: 'popular' });

			const searchName = req.query.name || '';
			const page = parseInt(req.query.page) || 1;
			const limit = 10;
			const skip = (page - 1) * limit;

			const buildSearchQuery = (name) => {
				if(!name || name.trim() === '') return {};
				return {
					name: {
						$regex: name.trim(),
						$options: 'i'
					}
				};
			};

			const filter = buildSearchQuery(searchName);
			const foods = await Food.find(filter)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean();


			// GET PAGINATED FOODS
			/*const foods = await Food.find()
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean();*/
			const totalPages = Math.ceil(totalFoods / limit);
			
			const ratings = await Food.find({}, 'rating');
			const totalRating = ratings.reduce((sum, food) => sum + (food.rating || 0), 0);
			const averageRating = totalRating / totalFoods;
			
			res.render('admin/foods', {
				foods: foods,
				totalFoods: totalFoods,
				activeDishes: activeDishes,
				popularDishes: popularDishes,
				averageRating: averageRating,
				currentPage: page,
				totalPages: totalPages,
				totalFoods: totalFoods,
				searchName: searchName
			});
		} catch(err) {
			next(err);
		}
	});

	router.get('/admin/orders', isLoggedIn, isAdmin, async (req, res) => {
	    try {
	        const page = parseInt(req.query.page) || 1;
	        const limit = 10;
	        const skip = (page - 1) * limit;
	        const searchQuery = req.query.search || '';
	        const sortBy = req.query.sort || 'newest';
	        const statusFilter = req.query.status || '';
	
	        // Build filter
	        let filter = {};
	        
	        // Add status filter
	        if (statusFilter) {
	            filter.status = statusFilter;
	        }
	        
	        // Add food name search filter
	        if (searchQuery) {
	            filter.foodName = { $regex: searchQuery, $options: 'i' };
	        }
	
	        // Build sort
	        let sort = {};
	        if (sortBy === 'newest') {
	            sort = { createdAt: -1 };
	        } else if (sortBy === 'oldest') {
	            sort = { createdAt: 1 };
	        } else if (sortBy === 'price_high') {
	            sort = { totalAmount: -1 };
	        } else if (sortBy === 'price_low') {
	            sort = { totalAmount: 1 };
	        }
	
	        // Get orders
	        const orders = await Order.find(filter)
	            .sort(sort)
	            .skip(skip)
	            .limit(limit)
	            .lean();
	
	        // Get counts
	        const totalOrders = await Order.countDocuments(filter);
	        const totalPages = Math.ceil(totalOrders / limit);
	
	        // Get status counts
	        const statusCounts = await Order.aggregate([
	            { $match: filter },
	            {
	                $group: {
	                    _id: "$status",
	                    count: { $sum: 1 }
	                }
	            }
	        ]);
	
	        // Convert to object
	        const statusStats = {};
	        statusCounts.forEach(item => {
	            statusStats[item._id] = item.count;
	        });
	
	        // Get total revenue
	        const revenueResult = await Order.aggregate([
	            { $match: filter },
	            {
	                $group: {
	                    _id: null,
	                    totalRevenue: { $sum: "$totalAmount" }
	                }
	            }
	        ]);
	
	        res.render('admin/orders', {
	            orders,
	            totalOrders,
	            pendingOrders: statusStats['pending'] || 0,
	            processingOrders: statusStats['processing'] || 0,
	            completedOrders: statusStats['completed'] || 0,
	            cancelledOrders: statusStats['cancelled'] || 0,
	            
	            currentPage: page,
	            totalPages,
	            searchQuery,
	            sortBy,
	            statusFilter,
	            totalRevenue: revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0
	        });
	
	    } catch (error) {
	        console.error('Error loading orders:', error);
	        res.status(500).render('error', { error: 'Failed to load orders' });
	    }
	});

	router.get('/admin/revenue', async (req, res, next) => {
		try {
			res.status(200).json({
				status: 200,
				message: "Will render Revenue soon",
			});
		} catch(err) {
			next(err);
		}
	});
	
	router.get('/admin/create', isLoggedIn, isAdmin, async (req, res, next) => {
		try {
			const foods = await Food.find();
			const totalFoods = await Food.countDocuments();

			const ratings = await Food.find({}, 'rating');
			const totalRating = ratings.reduce((sum, food) => sum + (food.rating || 0), 0);
			const averageRating = totalRating / totalFoods;

			const popularDishes = await Food.find({ category: 'popular' });
			
			res.render('admin/create', {
				foods: foods,
				totalFoods: totalFoods,
				averageRating: averageRating,
				popularDishes: popularDishes
			});
		} catch(err) {
			next(err);
		}
	});

	router.post('/admin/create', /*isLoggedIn, isAdmin,*/ async (req, res, next) => {
		try {
			const { name, price, image, calorie, category, preparationTime, foodInfo, rating } = req.body;

			if(!name || !price || !image || !calorie ||!category || !preparationTime || !foodInfo) {
				return res.status(429).send('Missing Important Food Metadata');
			}

			const newFood = new Food({
				name,
				price,
				image,
				foodInfo,
				calorie,
				category,
				preparationTime,
				rating
			});
			await newFood.save();
			res.status(201).send('<h1> Created! </h1> <a href="/"> View Foods </a>')
			
		} catch(err) {
			next(err);
		}
	});

	router.get('/admin/edit/:id', isLoggedIn, isAdmin, async (req, res, next) => {
		try {
			const id = req.params.id.toString();
			const food = await Food.findById(id);
			// const { name, price, images, quantity, colors, sizes } = req.body;
			// res.send('Will be edited, just wait...');
			res.json({
				message: 'This food will be editable soon',
				food
			});
		} catch(err) {
			next(err);
		}
	});

	router.get('/admin/delete/:id', async (req, res, next) => {
		try {
			const id = req.params.id.toString();
			const food = await Food.findById(id);
			res.render('delete', {
				food: food
			});
		} catch(err) {
			next(err);
		}
	});

	router.delete('/admin/delete/:id', async (req, res, next) => {
		try {
			const id = req.params.id.toString();
			const food = await Food.findById(id);
			res.json({
				message: "Food will soon be Deleted",
				food
			});
		} catch(err) {
			next(err);
		}
	});
	
	return router;
};
