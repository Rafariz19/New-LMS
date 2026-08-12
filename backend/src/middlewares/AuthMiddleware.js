const jwt = require("jsonwebtoken")

require("dotenv").config()

const verifyToken = (req, res, next) => {

    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({
            message: "Access denied"
        })
    }

    const token = authHeader.split(" ")[1]

    try {

        const verified = jwt.verify(token, process.env.JWT_SECRET)

        req.user = verified

        next()

    } catch (error) {

        res.status(401).json({
            message: "Invalid token"
        })

    }

}

const checkRole = (...roles) => {

    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {

            return res.status(403).json({
                message: "Forbidden"
            })

        }

        next()

    }

}



module.exports = {verifyToken, checkRole}