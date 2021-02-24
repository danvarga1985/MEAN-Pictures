const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');

const app = express();

// Using 'Node Environment Variables' - stored in nodemon.json
// user-password ... database name(mean-app) ? auth db (authSource=admin)
const uri = 'mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASSWORD +
  '@localhost:27017/mean-app?authSource=admin';


mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // 'useUnifiedTopology' - needed, otherwise error
    useCreateIndex: true // for: unique-validator warning
  })
  .then(() => {
    console.log('Connected to database');
  })
  .catch(() => {
    console.log('Connection failed');
  });

// For json 'deserialization'
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// Grant access to the image folder
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  next();
});

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);

module.exports = app;
