const mongoose = require('mongoose');
const rateSchema = new mongoose.Schema({

    star: {
        type: Number,
        default: 0
    },
    comment: String,
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    resturantId: {
        type: mongoose.Types.ObjectId,
        ref: "Resturant"
    },
    orderId: {
        type: mongoose.Types.ObjectId,
        ref: "Order"
    }

}, { timestamps: true });

//===============================
module.exports = mongoose.model("Rate", rateSchema)