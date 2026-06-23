const mongoose = require('mongoose');
const resturantSchema = new mongoose.Schema({

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
    location: {
        type: String,

        required: true
    },
    hoursework: {
        type: Number,
        default: 10
    },
    avgRate: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

//===============================
module.exports = mongoose.model("Resturant", resturantSchema)
    /// get all section from id resturanf
    //await Section.find({resturantId:id});//