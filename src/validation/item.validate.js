const { body } = require("express-validator");
const validate = require("../middlewares/validate");

const addItemValidate = [
    body("title").notEmpty().withMessage("title is required")
    .isString().withMessage('Title must be string'),
    body("image").
    if(body("image").exists())
    .isString().withMessage("Image must be string"),
    validate
]
module.exports = { addItemValidate }