const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // Get token from "Bearer TOKEN"
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

            req.user = decoded.id; // Attach user ID to request (or entire user object if needed)
            req.userRole = decoded.role; // Attach user role
            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.userRole === 'admin') { // Check if the authenticated user has 'admin' role
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };