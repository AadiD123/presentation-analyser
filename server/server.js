const express = require("express");
const cors = require("cors");
const multer = require("multer");
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to handle video chunks
app.post('/upload-video', upload.single('video'), async (req, res) => {
  try {
    console.log('Received video upload request');
    const videoBlob = req.file.buffer;
    console.log('Video blob received:', videoBlob);
    const timestamp = Date.now();
    const videoFileName = `video_${timestamp}.webm`;
    const videoFilePath = `./uploads/${videoFileName}`;
    fs.writeFileSync(videoFilePath, videoBlob);
    const wavFileName = `audio_${timestamp}.wav`;
    const wavFilePath = `./uploads/${wavFileName}`;

    ffmpeg()
      .input(videoFilePath)
      .audioCodec('pcm_s16le')
      .audioChannels(1)
      .audioBitrate(16)
      .audioFrequency(16000)
      .on('end', () => {
        console.log('Audio conversion finished');
        res.status(200).send('Video and audio uploaded successfully');
      })
      .on('error', (err) => {
        console.error('Error converting audio:', err);
        res.status(500).send('Error converting audio');
      })
      .save(wavFilePath);
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).send('Error uploading video');
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
