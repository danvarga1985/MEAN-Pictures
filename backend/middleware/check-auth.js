const jwt = require('jsonwebtoken');

// Token validation
module.exports = (req, res, next) => {
  try {
    // Access token in the header.
    // Header: e.g. (Bearer - token) - 'Bearer asdfasdfasdf432df' ... 'Bearer' is not necessary, but is a convention.
    const token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, 'secret_this_should_be_longer');
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Authentication failed!'
    });
  }

};
