//
require('dotenv').config();
const connectDB = require('../utils/connectDB');
const User = require('./../models/User');
const passwordService = require('./../utils/passwordService')

const createAdmin = async() => {
    await connectDB()
    const adminData = {

        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password: await passwordService.hash(process.env.ADMIN_PASSWORD),
        phone: process.env.ADMIN_PHONE,
        role: "admin"
    }
    console.log(adminData)
        //find if admi  is exists 
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
        throw new Error("admin is already exists")
    }
    await User.create(adminData);
}

createAdmin()
    .then((e) => {
        console.log("Done operator")
    })
    .catch((e) => {
        console.log("error", e.message)
    })
    .finally(() => {
        console.log("Task finished");
        process.exit()
    })