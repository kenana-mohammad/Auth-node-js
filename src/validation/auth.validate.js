const { body } = require("express-validator")
const validate = require("../middlewares/validate");
const User = require("../models/User");

const registerValidate = [
    body('email')
    //تحقق اذا موجود عملو تحقق متل update
    // .if(body("password").existes())
    .isString().withMessage('the email must be string').isEmail()
    .withMessage('email is not valid')
    //فينا عمل custom validate عشان نتاكد انو الايميل موجود في الداتا بيز ولا لا
    .custom(async val => {
        const user = await User.findOne({ email: val });
        if (user) {
            throw new Error('the email is already exists')
        }
        return true
    }),
    body('name').isString().withMessage('the name must be string').isLength({ min: 2, max: 100 }).withMessage('the name must be between 2 and 100 characters'),
    body('phone').isString().withMessage('the phone must be string').isMobilePhone().withMessage('the phone must be valid'),
    body('password').isString().withMessage('the password must be string').isStrongPassword({
        minLength: 8,
        minLowercase: 2,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }).withMessage('the password must be a strong password'), validate
]

//
const loginValidate = [

    body('email').isString().withMessage('invaild email').isEmail().withMessage('invaild email'),

    body('password').isString().withMessage('Invalid password').isStrongPassword({
        minLength: 8,
        minLowercase: 2,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }).withMessage('Invalid password'),
    validate

]
module.exports = { registerValidate, loginValidate }