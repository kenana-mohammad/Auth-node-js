const express = require('express');
const itemController = require('../controllers/item.controller');
const asyncHandler = require('../utils/asyncHandler');
const { addItemValidate } = require('../validation/item.validate');
const router = express.Router();
router.get('/', asyncHandler(itemController.getAll));
router.post('/', [...addItemValidate], asyncHandler(itemController.add));

module.exports = router