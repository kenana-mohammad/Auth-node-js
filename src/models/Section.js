const mongoose = require('mongoose');
const sectionSchema = new mongoose.Schema({

    title: {
        type: String
    },
    descraption: {
        type: String
    },
    resturantId: {
        type: mongoose.Types.ObjectId,
        ref: "Resturant"
    }

}, { timestamps: true });

//===============================
module.exports = mongoose.model("Section", sectionSchema)
    //1.m
    //get all sections with resturant details
    // await  Section.find().populate('resturantId');
    //لان ال refموجود هون بقدر استخدم poplate