require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
	console.log('Order DB connected');
})
.catch((err) => {
	console.log('Order DB connection failed: ', err.message);
	process.exit(1);
});

// Add to your Order model (models/Order.js)
const orderSchema = new mongoose.Schema({
    foodId: {
        type: String,
        required: [ true, 'Food ID is required' ]
    },
    orderId: {
    	type: String,
    	default: new mongoose.Types.ObjectId()
    },
    orderedBy: {
        type: String,
        required: [ true, 'User ID is required' ]
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    },
    itemCount: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
