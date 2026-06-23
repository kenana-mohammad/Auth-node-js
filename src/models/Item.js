const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
    title: {

        type: String,
        required: true
    },
    image: String

}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;