const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to handle video chunks
app.post('/upload-video', upload.single('video'), async (req, res) => {
  try {
    console.log('Received video upload request');
    const videoBlob = req.file.buffer;
    console.log('Video blob received:', videoBlob);
    const videoFilePath = './uploads/test.mp4';
    require('fs').writeFileSync(videoFilePath, videoBlob);
    res.status(200).send('Video uploaded successfully');
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).send('Error uploading video');
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
