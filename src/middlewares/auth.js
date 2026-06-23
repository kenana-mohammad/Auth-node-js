//
const cookiesService = require('../utils/cookiesService');
const jwtService = require('./../utils/jwtService');
const auth = (req, res, next) => {
    try {
        //to change storage from local storage to cookies
        // const authorization = req.headers.authorization; //barear
        // const token = cookiesService.getData(req, 'accesstoken')
        const token = cookiesService.getAccessToken(req)

        //check if user post token بعت التوكين
        if (!token) {
            return res.status(403).json({
                msg: "Not Authorized=="
            })
        }
        //fetch the token ;
        // const token = authorization.split(" ")[1];
        // console.log(token)

        //بفكو
        //
        //verify the token is random text or exppire or not genrate from system
        //not the same sectrt ey
        const decoded = jwtService.verifyAccessToken(token);
        //send data to api to use it in profile
        req._user = {...decoded }
        console.log(decoded)
        next()

    } catch (error) {
        //if the token is expirein or not genrate from system
        //عتند الحاجة خلص عمرو استديه
        //refreshTokenfunction()
        return res.status(403).json({
            msg: "Not Authorized"
        })
    }

}
module.exports = auth