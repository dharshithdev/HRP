// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const protect = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({ message: 'User no longer exists' });
            }

            if (!user.isActive) {
                return res.status(403).json({ 
                    message: 'Your account has been deactivated. Access revoked.' 
                });
            }

            req.user = user; 
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = {protect};