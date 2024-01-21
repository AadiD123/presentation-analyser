const express = require("express");
const cors = require("cors");
const multer = require("multer");
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { spawn } = require("child_process");

async function convertWebmToMp3(webmBlob) {
  const ffmpeg = createFFmpeg({ log: false });
  await ffmpeg.load();

  const inputName = 'input.webm';
  const outputName = 'output.mp3';

  ffmpeg.FS('writeFile', inputName, await fetch(webmBlob).then((res) => res.arrayBuffer()));

  await ffmpeg.run('-i', inputName, outputName);

  const outputData = ffmpeg.FS('readFile', outputName);
  const outputBlob = new Blob([outputData.buffer], { type: 'audio/wav' });

  return outputBlob;
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
const audioDir = path.join(__dirname, 'model/audio_files');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload-video', upload.single('video'), async (req, res) => {
  try {
    console.log('Received video upload request');
    const videoBlob = req.file.buffer;
    const timestamp = Date.now();
    const videoFileName = `video_${timestamp}.webm`;
    const videoFilePath = path.join(uploadsDir, videoFileName);
    fs.writeFileSync(videoFilePath, videoBlob);
    const wavFileName = `audio_${timestamp}.wav`;
    const wavFilePath = path.join(audioDir, wavFileName);
    console.log('WAV file started:', wavFilePath);
    const ffmpegProcess = ffmpeg(videoFilePath)
      .output(wavFilePath)
      .on('end', () => {
        console.log('WAV file created:', wavFilePath);
        res.send('Video uploaded');
      })
      .on('error', (err) => {
        console.error('Error creating WAV file:', err);
        res.status(500).send('Error creating WAV file');
      })
      .run();
    
    const pythonProcess = spawn('python3', ["./model/test.py", wavFileName, videoFileName]);

        pythonProcess.stdout.on('data', (data) => {
          console.log(data.toString());
        });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).send('Error uploading video');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
