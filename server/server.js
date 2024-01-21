const express = require("express");
const cors = require("cors");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

async function convertWebmToMp3(webmBlob) {
  const ffmpeg = createFFmpeg({ log: false });
  await ffmpeg.load();

  const inputName = "input.webm";
  const outputName = "output.mp3";

  ffmpeg.FS(
    "writeFile",
    inputName,
    await fetch(webmBlob).then((res) => res.arrayBuffer())
  );

  await ffmpeg.run("-i", inputName, outputName);

  const outputData = ffmpeg.FS("readFile", outputName);
  const outputBlob = new Blob([outputData.buffer], { type: "audio/wav" });

  return outputBlob;
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, "uploads");
const audioDir = path.join(__dirname, "model/audio_files");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload-video", upload.single("video"), async (req, res) => {
  try {
    console.log("Received video upload request");
    const videoBlob = req.file.buffer;
    const timestamp = Date.now();
    const videoFileName = `video_${timestamp}.webm`;
    const videoFilePath = path.join(uploadsDir, videoFileName);
    fs.writeFileSync(videoFilePath, videoBlob);
    const wavFileName = `audio_${timestamp}.wav`;
    const wavFilePath = path.join(audioDir, wavFileName);
    console.log("WAV file started:", wavFilePath);

    ffmpeg(videoFilePath)
      .output(wavFilePath)
      .on("end", async () => {
        console.log("WAV file created:", wavFilePath);

        const pythonProcess = spawn("python3", [
          "./model/test.py",
          wavFileName,
          videoFileName,
        ]);

        let parsedData = await new Promise((resolve, reject) => {
          let dataChunks = [];
          pythonProcess.stdout.on("data", (data) => {
            dataChunks.push(data);
          });

          pythonProcess.stdout.on("end", () => {
            const dataString = Buffer.concat(dataChunks).toString();
            console.log("datastring", dataString);
            console.log("end datastring");
            const lines = dataString.split("\n");

            // Initialize parsedData object
            let parsedData = {
              articulationDatapoints: [],
              pausesDatapoints: [],
              overallBalance: null,
              totalNumberOfPauses: null,
              transcription: "",
              fillerWords: [],
              repeats: [],
              stutter: [],
              likes: [],
            };

            // Parsing the data here
            parsedData["articulationDatapoints"] = JSON.parse(lines[0]);
            parsedData["pausesDatapoints"] = JSON.parse(lines[1]);
            parsedData["overallBalance"] = parseFloat(lines[2].split(": ")[1]);
            parsedData["totalNumberOfPauses"] = parseFloat(
              lines[3].split(": ")[1]
            );

            let i = 4;
            while (lines[i][0] === "[") {
              i++;
            }
            parsedData["transcription"] = lines[i].split(": ")[1];
            let valid_json_str = lines[i + 1].replace(/'/g, '"');
            let input_data = JSON.parse(valid_json_str);
            parsedData["fillerWords"] = input_data.map(([word, time]) => ({
              word,
              time,
            }));
            valid_json_str = lines[i + 2].replace(/'/g, '"');
            input_data = JSON.parse(valid_json_str);
            parsedData["repeats"] = input_data.map(([word, time]) => ({
              word,
              time,
            }));
            valid_json_str = lines[i + 3].replace(/'/g, '"');
            input_data = JSON.parse(valid_json_str);
            parsedData["stutter"] = input_data.map(([word, time]) => ({
              word,
              time,
            }));
            valid_json_str = lines[i + 4].replace(/'/g, '"');
            input_data = JSON.parse(valid_json_str);
            parsedData["likes"] = input_data.map(([word, time]) => ({
              word,
              time,
            }));
            console.log(lines);
            parsedData["eyeContactPenalty"] = parseFloat(lines[i + 5]);
            parsedData["FinalScore"] = parseFloat(lines[i + 6]);

            input_data = JSON.parse(valid_json_str);

            console.log(parsedData);
            resolve(parsedData);
          });

          pythonProcess.on("error", (err) => {
            reject(err);
          });
        });

        res.status(200).send(parsedData);
      })
      .on("error", (err) => {
        console.error("Error creating WAV file:", err);
        res.status(500).send("Error creating WAV file");
      })
      .run();
  } catch (error) {
    console.error("Error uploading video:", error);
    if (!res.headersSent) {
      res.status(500).send("Error uploading video");
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
