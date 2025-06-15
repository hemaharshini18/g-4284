const authorize = (roles = []) => {
  // roles param can be a single role string (e.g., 'ADMIN') 
  // or an array of roles (e.g., ['ADMIN', 'HR'])
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // req.user is expected to be set by the 'auth' middleware
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication error, user not found.' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      // user's role is not authorized
      return res.status(403).json({ msg: 'Forbidden: You do not have permission to perform this action.' });
    }

    // authentication and authorization successful
    next();
  };
};

module.exports = authorize;
