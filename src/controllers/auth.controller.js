const User = require("../models/User");
const cookiesService = require("../utils/cookiesService");
const jwtService = require("../utils/jwtService");
const passwordService = require("../utils/passwordService");

class AuthController {
    handleFailedLogin = async (user) => {
        user.failedLoginAttempt = +(user.failedLoginAttempt || 0) + 1;
        if (user.failedLoginAttempt >= 5) {
            user.blocked = true;
            user.lockedUntil = new Date(Date.now() + (30 * 60 * 1000));
        }
        await user.save();
    };

    resetFailedLoginAttempt = async (user) => {
        user.blocked = false;
        user.lockedUntil = null;
        user.failedLoginAttempt = 0;
        await user.save();
    };

    register = async (req, res) => {
        const { name, email, phone, password } = req.body;
        const hashed = await passwordService.hash(password);
        let user = await User.create({ name, email, phone, password: hashed });
        user = user.toObject();
        delete user.password;
        return res.status(201).json(user);
    };

    login = async (req, res) => {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json("invalid credentials");
        }

        if (user.blocked) {
            if (user.lockedUntil <= new Date()) {
                await this.resetFailedLoginAttempt(user);
            } else {
                return res.status(400).json('you can not login now try again');
            }
        }

        const isVerified = await passwordService.compare(password, user.password);
        if (!isVerified) {
            await this.handleFailedLogin(user);
            return res.status(400).json("invalid credentials");
        }

        await this.resetFailedLoginAttempt(user);
        user = user.toObject();
        delete user.password;

        const token = jwtService.genrateAccessToken({
            _id: user._id,
            email: user.email,
            role: user.role
        });
        const refreshToken = jwtService.genrateRefreshToken({
            _id: user._id,
            email: user.email,
            role: user.role
        });

        cookiesService.setAccessToken(res, token);
        cookiesService.setRefreshToken(res, refreshToken);

        return res.status(201).json({ user });
    };

    refresh = async (req, res) => {
        const refrehToken = cookiesService.getRefreshToken(req);
        if (!refrehToken) {
            return res.status(401).json({
                msg: "refresh token is reqired"
            });
        }
        const decoded = jwtService.verifyRefreshToken(refrehToken);
        const data = {
            id: decoded._id,
            email: decoded.email,
            role: decoded.role
        };

        const token = jwtService.genrateAccessToken(data);
        const refToken = jwtService.genrateRefreshToken(data);

        cookiesService.setAccessToken(res, token);
        cookiesService.setRefreshToken(res, refToken);
        return res.status(200).json("Refreshed token is successfully");
    };

    logout = (req, res) => {
        cookiesService.clearTokens(res);
        return res.status(201).json('logout is succesfully');
    };

    profile = async (req, res) => {
        const userId = req._user._id;
        const user = await User.findById(userId).select('-password');
        return res.status(200).json({
            profile: user
        });
    };
}

module.exports = new AuthController();
