const { default: mongoose } = require('mongoose');

//
require('dotenv').config();
const connectDB = async() => {
    mongoose.connect(process.env.MONGOOSE_URL)
        .then(() => {
            console.log("connected to mongoose")
        })
        .catch((error) => {
            console.log("Error", error.message)

        })
}
module.exports = connectDB;