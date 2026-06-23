const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    role: {
        type: String,
        default: "customer",
        enum: ["customer", "driver", "resturant-owner","admin"]
    },
    email: {
        type: String,
        unique: [true, 'email must be unique'],
        required: true
    },
    avatar: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        unique: [true, 'the phone must be unique'],
        required: true
    },
    // isBlocked: {
    //     type: Boolean,
    //     default: false
    // },
    // countTries: {
    //     Type: Number,
    //     default: 0

    // },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    realtimelocation: {
        type: String
    },
    available: {
        type: Boolean,
        default: true
    },
    blocked: {
        type: Boolean,
        default: false
    },
    failedLoginAttempt: {
        type: Number,
        default: 0
    },
    lockedUntil: Date



}, { timestamps: true });

//===============================
module.exports = mongoose.model("User", userSchema)
    //1.1
    //get all profile data in this user
    //if exists userid profile 
    //user.findByid().popluate('profileId')
    //userId=>profile
    //Profile.findOne({userId:id})