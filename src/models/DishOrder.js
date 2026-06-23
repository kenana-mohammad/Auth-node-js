const mongoose = require('mongoose');
const orderDishSchema = new mongoose.Schema({




    orderId: {
        type: mongoose.Types.ObjectId,
        ref: "Order"
    },
    dishId: {
        type: mongoose.Types.ObjectId,
        ref: "Dish"
    },
    //مشان الجرد
    price: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        default: 1
    },
    total: {
        type: Number,
        default: 1
    }

}, { timestamps: true });

//===============================
module.exports = mongoose.model("DishOrder", orderDishSchema);
//Dishorder
//get all dishes to order id
//await DishOrder.find({orderId:id}).populate('dishId');