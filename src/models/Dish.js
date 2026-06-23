const mongoose = require('mongoose');
const dishSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    descrpation: {
        type: String,

    },
    photo: {
        type: String,
        default: "a.bng"

    },
    price: {
        type: string,
        default: 0
    },
    available: {
        type: Boolean,
        default: 0
    },
    sectionId: {
        type: mongoose.Types.ObjectId,
        ref: "Section"
    }
}, { timestamps: true });

//===============================
module.exports = mongoose.model("Dish", dishSchema)
    //===============================
module.exports = mongoose.model("Dish", dishSchema)
    //===============================
module.exports = mongoose.model("Dish", dishSchema)