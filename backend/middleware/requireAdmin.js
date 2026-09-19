const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

/**
 * Verifies the JWT from the Authorization: Bearer <token> header.
 * Attaches req.admin = { id, name, email } on success.
 */
const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Access denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Confirm the user still exists in the DB
    const admin = await AdminUser.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({ message: 'User not found. Token invalid.' });
    }

    req.admin = { id: admin._id, name: admin.name, email: admin.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = requireAdmin;
