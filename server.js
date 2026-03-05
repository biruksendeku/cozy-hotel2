require('dotenv').config();

const app = require('./app');
const mongoose = require('mongoose');

const Food = require('./models/Food');
const User = require('./models/User');

const port = process.env.PORT || 3000;

mongoose.connection.once('open', async () => {
	app.listen(port, () => {
		console.log(`Server listening on port ${port}...`);
	});
	const foods = await Food.find();
	// console.log('FOODS: ', foods);

	const sessions = await mongoose.connection.db
		.collection('session')
		.find()
		.toArray();
	// console.log('SESSIONS: ', sessions);

	// const users = await User.find();
	// users.forEach(u => { console.log('USER CART: ', u.cart)});
});
