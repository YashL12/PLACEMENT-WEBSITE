const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'placement_portal_jwt_secret_secure_key_2026'
      );

      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Admin user not found',
        });
      }

      req.admin = admin;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token is invalid or expired',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided in Authorization header',
    });
  }
};

module.exports = { protect };
