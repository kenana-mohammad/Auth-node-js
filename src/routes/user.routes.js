const express = require('express');
const router = express.Router()
const asyncHandler = require('../utils/asyncHandler');
const userController = require('../controllers/user.controller');
const id = require('../middlewares/id');
const role = require('../middlewares/role');
const auth = require('../middlewares/auth');
const { deleteUserValidate } = require('../validation/users.validate');
router.get('/', asyncHandler(userController.getAll));
router.get('/test', [auth, role(['admin'])], (req, res) => {
    return res.status(200).json({ msg: 'done' })

})
router.get('/:id', [id], asyncHandler(userController.getById))
router.post('/', [auth, role(['admin', 'customer'])], asyncHandler(userController.add))
router.put('/:id', asyncHandler(userController.update))
    //فينا نشيل مدل وير id من الراوت ونحطه في الكنترولر بس حلو انو يكون في الراوت عشان كل راوت يكون مسؤول عن التحقق من البيانات الي جايه له
router.delete('/:id', [...deleteUserValidate], asyncHandler(userController.remove))

module.exports = router