const { param } = require("express-validator");
const validate = require("../middlewares/validate");

const deleteUserValidate = [
    //validate id param
    param('id').isMongoId().withMessage('invalid Id=='), validate
]
module.exports = { deleteUserValidate }