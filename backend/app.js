const express = require("express");
// const {
//   updateImportEqualsDeclaration
// } = require('typescript');
const bodyParser = require("body-parser")

const app = express();

// For json "deserialization"
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
})

app.post("/api/posts", (req, res, next) => {
  const post = req.body;
  console.log(post);
  res.status(201).json({
    message: 'Post added successfully'
  });
})

app.get('/api/posts', (req, res, next) => {
  const posts = [{
      id: guidGenerator(),
      title: 'First server-side post',
      content: 'This is coming from the server'
    },
    {
      id: guidGenerator(),
      title: 'Second server-side post',
      content: 'This is coming from the server'
    }

  ];
  res.status(200).json({
    message: 'Posts fetched successfully!',
    posts: posts
  });
});

module.exports = app;

function guidGenerator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
