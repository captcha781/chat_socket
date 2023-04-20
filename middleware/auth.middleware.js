const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authCheck = async (req, res, next) => {
    try {

        const { authorization } = req.headers

        if (!authorization) {
            return res.status(400).json({ success: 'false', message: 'Unauthorized' })
        }
        
        let token = authorization.replace("Bearer ", "")

        jwt.verify(token, process.env.JWT_SECRET)
        
        let decodedToken = jwt.decode(token)

        req.user = await User.findById(decodedToken.userId)

        return next()

    } catch (error) {
        return { success: 'false', message: 'Unauthorized' }
    }
}

module.exports = authCheck