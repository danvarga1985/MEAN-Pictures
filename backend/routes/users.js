const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../model/user');
const user = require('../model/user');

const router = express.Router();

router.post('/signup', (req, res, next) => {
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
            error: err
          });
        })
    })
});

router.post('/login', (req, res, next) => {
  User.findOne({
      email: req.body.email
    })
    .then(user => { //TODO: figure out why this works! 'user' should not be accessible from the chained then-blocks.
      console.log('User logged in:' + user);
      if (!user) {
        return res.status(401).json({
          message: 'Authentication Failed!'
        });
      }

      // Compare the stored hash value with the given passwords hashed value
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      // Failure
      if (!result) {
        return res.status(401).json({
          message: 'Authentication Failed!'
        });
      }

      // Success
      // Create a new token based on the input-data
      const token = jwt.sign({
        email: user.email,
        userId: user._id
      }, 'secret_this_should_be_longer', {
        expiresIn: '1h'
      });

      res.status(200).json({
        token: token,
        expiresIn: 3600
      })

    })
    .catch(err => {
      return res.status(401).json({
        message: 'Authentication Failed!'
      });
    })
});

module.exports = router;
