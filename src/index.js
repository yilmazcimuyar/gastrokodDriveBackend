const express = require("express");
const { google } = require("googleapis");
const multer = require("multer");

const cors = require("cors");
const { Readable } = require("stream");
const app = express();

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

app.use(cors());

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "service.json",
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    const drive = google.drive({
      version: "v3",
      auth: auth,
    });
    const uploadedFiles = [];

    const file = req.file;
    const extension = file.mimetype.split("/").pop();

    const response = await drive.files.create({
      requestBody: {
        name: `${Date.now()}.${extension}`,
        mimeType: file.mimetype,
        parents: ["1QnIEalL7B7JrvSwtzrBPNBIiL7O9PEkh"],
      },
      media: {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      },
    });

    uploadedFiles.push(response.data);

    res.json({ files: uploadedFiles });
  } catch (e) {
    console.log(e);
    res.status(500).send("Dosya yükleme hatası");
  }
});

app.listen(5000, () => {
  console.log("App is listening on port 5000");
});
