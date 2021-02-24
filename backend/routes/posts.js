const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/image');
const PostController = require('../controllers/post-controller');

router.post(
  '',
  checkAuth,
  extractFile,
  PostController.createPost);

router.put(
  '/:id',
  checkAuth,
  extractFile,
  PostController.updatePost);

router.get('', PostController.getAllPosts);

router.get('/:id', PostController.getPostById);

router.delete(
  '/:id',
  checkAuth,
  PostController.deletePostById
);

module.exports = router;
