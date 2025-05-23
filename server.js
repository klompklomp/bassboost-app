const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));
app.use('/processed', express.static(path.join(__dirname, 'processed')));

// Ensure directories exist
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('processed')) fs.mkdirSync('processed');

// Multer setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `input-${Date.now()}.mp3`);
  }
});
const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('audioFile'), (req, res) => {
  const inputPath = req.file.path;
  const outputFile = `output-${Date.now()}.mp3`;
  const outputPath = path.join('processed', outputFile);

  const command = `ffmpeg -i ${inputPath} -af "bass=g=25,volume=15,acrusher=level_in=3:level_out=1:bits=6:mode=log,aecho=0.8:0.88:60:0.4" ${outputPath}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error during processing:', error);
      return res.status(500).send('Error processing file.');
    }

    res.json({ file: `/processed/${outputFile}` });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
