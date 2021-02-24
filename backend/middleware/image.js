const multer = require('multer');

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

module.exports = multer({
  storage: storage
}).single('image')
