const express = require("express");
const cors = require("cors");
const app = express();

const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Configure as needed

app.use(cors());

app.post("/upload", upload.single("video"), (req, res) => {
  // 'video' corresponds to the key in FormData
  console.log(req.file); // Information about the file
  res.send("Video uploaded successfully");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
