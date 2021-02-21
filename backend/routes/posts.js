const express = require('express');
const multer = require('multer');

const Post = require('../model/post');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

// Configure Multer where to store files.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype]; // return undefined if not found
    let error = new Error('Invalid Mine Type')
    // check whether value is not null or undefined
    if (isValid) {
      error = null;
    }

    // Path is relative to 'server.js'
    cb(error, 'backend/images');
  },
  filename: (req, file, cb) => {
    // This misses the .extension...
    const name = file.originalname.toLowerCase().split(' ').join('-');
    // But Multer gives access to it.
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
})

router.post(
  '',
  checkAuth,
  multer({
    storage: storage
  })
  .single('image'), (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + '/images/' + req.file.filename
    });

    // 'save' provided by mongoose - creates a new query to insert a new entry
    post.save()
      .then(createdPost => {
        res.status(201).json({
          message: 'Post added successfully',
          post: {
            ...createdPost,
            id: createdPost._id
          }
        });
      });

  });

router.put(
  '/:id',
  checkAuth,
  multer({
    storage: storage
  }).single('image'),
  (req, res, next) => {
    let imagePath = req.body.imagePath;

    if (req.file) {
      const url = req.protocol + '://' + req.get('host');
      imagePath = url + '/images/' + req.file.filename;
    }
    const updatedPost = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath
    })
    Post.updateOne({
        _id: req.params.id
      }, updatedPost)
      .then(result => {
        console.log(result);
        res.status(200).json({
          message: 'Update successful'
        });
      })
  });

router.get('', (req, res, next) => {
  // Pagination
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find(); // Only gets executed when calling 'then()'
  let fetchedPosts;

  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1)) // Ignore the first 'n' elements
      .limit(pageSize); // Narrow the result to the number of items to be displayed on the page
  }

  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.countDocuments();
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count
      });
    });
});

router.get('/:id', (req, res, next) => {
  Post.findById({
      _id: req.params.id
    })
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({
          message: 'Post not found!'
        });
      }
    });
});

router.delete('/:id',
  checkAuth,
  (req, res, next) => {
    Post.deleteOne({
        _id: req.params.id
      })
      .then(result => {
        console.log(result);
        res.status(200).json({
          message: 'Post with id: ' + req.params.id + ' deleted'
        })
      });
  });

module.exports = router;
