const jwt = require("jsonwebtoken");
const User = require("../Models/User");


exports.isAuthenticatedUser = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Please login to access this resource"
        })
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET)

    // console.log(decodedData)
    req.user = await User.findById(decodedData.id);
    next()
}

exports.isAdmin = async (req, res, next) => {
    if (!req.user){
        return res.status(401).json({
            success: false,
            message: "Please login to access this resource"
        })
    }
    let user = await User.findById(req.user)

    if (!user){
        return res.status(400).json({
            success: false,
            message: "Try login again"
        })
    }

    const {isAdmin} = user;
    if (!isAdmin) {
        return res.status(401).json({
            success: false,
            message: "Only admin can access this resource"
        })
    }
    next()
}