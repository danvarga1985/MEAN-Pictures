const Post = require('../model/post');


exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
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
    })
    .catch(error => {
      res.status(500).json({
        message: 'Creating a Post failed!'
      })
    });
};

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;

  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  }
  const updatedPost = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  })
  Post.updateOne({
      _id: req.params.id,
      creator: req.userData.userId
    }, updatedPost)
    .then(result => {
      // Check if the Post were found.
      if (result.n > 0) {
        console.log(result);
        res.status(200).json({
          message: 'Update successful'
        });
      } else {
        res.status(401).json({
          message: 'Not authorized'
        })
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Couldn\'t update Post'
      })
    });
};

exports.getAllPosts = (req, res, next) => {
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
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching Posts failed!'
      })
    });
};

exports.getPostById = (req, res, next) => {
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
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching Posts failed!'
      })
    });
};

exports.deletePostById = (req, res, next) => {
  Post.deleteOne({
      _id: req.params.id,
      creator: req.userData.userId
    })
    .then(result => {
      if (result.n > 0) {
        console.log(result);
        res.status(200).json({
          message: 'Post with id: ' + req.params.id + ' deleted'
        })
      } else {
        res.status(401).json({
          message: 'Not authorized'
        })
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Deleting Post failed!'
      })
    });
};
