const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const authController = require('./../controllers/auth.controller');
const { LoginLimiter } = require('../middlewares/limiter');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { registerValidate, loginValidate } = require('../validation/auth.validate');
router.get('/profile', [auth], asyncHandler(authController.profile));

router.post('/register',
    //
    [...registerValidate], asyncHandler(authController.register)
);
router.post('/login', [...loginValidate], asyncHandler(authController.login));
router.put('/refresh', asyncHandler(authController.refresh));

router.post('/logout', [auth], asyncHandler(authController.logout));
module.exports = router