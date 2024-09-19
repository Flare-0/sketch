const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const secrets = require('./secrets');
const geminiapitoken = secrets.geminiApiKey;
// Multer setup for image storage
const storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage
}).single('image');

// Upload route
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading image.' });
    }
    res.json({ imageUrl: `http://localhost:3000/uploads/${req.file.filename}` });
  });
});

app.use('/uploads', express.static('uploads'));

app.listen(3000, () => console.log('Server started on port 3000'));
