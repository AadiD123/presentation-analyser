const express = require("express");
const cors = require("cors");
const app = express();

const multer = require("multer");

app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

app.post("/upload-video", upload.single("video"), (req, res) => {
  // 'video' corresponds to the key in FormData
  console.log(req.file); // Information about the file
  res.send("Video uploaded successfully");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
