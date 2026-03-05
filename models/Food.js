require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
        console.log('Food Database Connected');
})
.catch((err) => {
        console.log('Failed to connect to DB: ', err.message);
        process.exit(1);
});

const foodSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [ true, 'Food Name is required' ]
        },
        price: {
            type: String, // because of currency
            required: [ true, 'Food Price is required' ]
        },
        imageUrl: {
            type: String, // it's cloud url, after uploaded by multer
   			required: [ true, 'Food image is required' ]
        },
        imagePublicId: {
        	type: String,
        	required: [ true, 'Food Image Public Id is required' ]
        },
        calorie: {
        	type: Number,
        	required: [ true, 'Calorie content is required' ]
        },
        category: {
        	type: String,
        	lowercase: true,
        	required: [ true, 'Food Category is required' ]
        },
        foodInfo: {
        	type: String,
        	required: [ true, 'Food Information is required' ]
        },
        preparationTime: {
        	type: String,
        	required: [ true, 'Food Preparation is time required' ]
        },
        status: {
        	type: String,
        	default: 'active'
        }, // active, inactive status
        reviews: {
        	type: Array,
        	default: []
        }, // eg. [ { user: 'email', review: 'sooo tasty' } ]
        orderedBy: {
        	type: Array,
        	default: []
        },
        rating: {
        	type: Number,
        	min: 0,
        	max: 5,
        	default: 4.7,
        },
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);
