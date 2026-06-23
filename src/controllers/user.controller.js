const User = require('./../models/User')
class UserController {
    getAll = async(req, res) => {
        const users = await User.find();
        res.status(200).json(users)
    }
    getById = async(req, res) => {
        const id = (req.params.id);
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json('not found user')
        }
        res.status(200).json(user)
    }
    add = async(req, res) => {
            const {
                name,
                email,
                phone,
                password,
                address,
                realtimelocation
            } = req.body;
            const data = await User.create({
                name,
                email,
                phone,
                password,
                address,
                realtimelocation
            })
            return res.status(201).json(data)
        }
        //
    update = async(req, res) => {
        const id = (req.params.id);
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json('not found user')
        }
        const {
            name,
            email,
            phone,
            password,
            address,
            realtimelocation
        } = req.body;
        user.name = name || user.name;
        user.password = password || user.password;

        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.realtimelocation = realtimelocation || user.realtimelocation;
        await user.save()
        return res.status(200).json({
            msg: "updated",
            data: user
        })
    }
    remove = async(req, res) => {
        const id = (req.params.id);
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json('not found user')
        }
        await User.findByIdAndDelete(id);
        return res.status(200).json({
            msg: "removed",
            data: null
        })

    }
}




module.exports = new UserController()