const express = require("express");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");

const app = express();

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to handle video chunks
app.post("/upload-chunk", upload.single("chunk"), (req, res) => {
  const chunk = req.file.buffer;
  // Append the received chunk to the video file
  fs.appendFileSync("uploads/video.webm", chunk);
  res.status(200).send("Chunk uploaded successfully!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
