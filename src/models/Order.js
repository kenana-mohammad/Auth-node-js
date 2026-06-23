const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({

    status: {
        type: String,
        enum: ['pending', 'accepted', 'in-progress',
            'on-the-way',
            'completed', 'canceled'
        ],
        default: 'pending'
    },
    total: {
        type: Number,
        required: true
    },
    customerId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    driverId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    resturantId: {
        type: mongoose.Types.ObjectId,
        ref: "Resturant"
    }

}, { timestamps: true });

//===============================
module.exports = mongoose.model("Order", orderSchema)