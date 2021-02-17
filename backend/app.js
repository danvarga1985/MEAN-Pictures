const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');

const app = express();

// user-password ... database name(mean-app) ? auth db (authSource=admin)
const uri = 'mongodb://root:root@localhost:27017/mean-app?authSource=admin';

// 'useUnifiedTopology' - needed, otherwise error
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
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

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  next();
});

app.use('/api/posts', postsRoutes);

module.exports = app;
