const express = require('express');
const path = require('path');
const app = express();

const port = 3000;
const publicFolder = path.join(__dirname, 'public');

app.set('view engine', 'ejs');

app.use(express.static(publicFolder));

app.get('/', (req, res) => {
	res.render('home', {
		title: 'Hotel Transylvania | Warm Welcome Guests!'
	});
});

app.get('/create', (req, res) => {
	res.render('admin/create');
});

app.get('/orders', (req, res) => {
	res.render('admin/order', {
		orders: [],
		query: []
	});
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}...`);
});
