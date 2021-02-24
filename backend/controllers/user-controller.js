const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../model/user');

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });

      user.save()
        .then(result => {
          res.status(201).json({
            message: 'User Created',
            result: result
          });
        })
        .catch(err => {
          res.status(500).json({
            message: 'Invalid Username or Password'
          });
        });
    });
}

exports.loginUser = (req, res, next) => {
  let fetchedUser;
  User.findOne({
      email: req.body.email
    })
    .then(user => {
      // TODO: this error handling will result in multiple response headers (the end catch block runs for some reason)
      // -> mongoose documentation
      // if (!user) {
      //   return res.status(401).json({
      //     message: 'Authentication Failed! - No Email'
      //   });
      // }

      fetchedUser = user;

      // Compare the stored hash value with the given passwords hashed value
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      // Failure
      if (!result) {
        return res.status(401).json({
          message: 'Authentication Failed! - Wrong Password'
        });
      }

      // Success
      // Create a new token based on the input-data
      const token = jwt.sign({
        email: fetchedUser.email,
        userId: fetchedUser._id
      }, process.env.JWT_KEY, {
        expiresIn: '1h'
      });

      console.log('User logged in:' + fetchedUser);

      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id
      })

    })
    .catch(err => {
      res.status(401).json({
        message: 'Invalid Credentials'
      });
    })
};
