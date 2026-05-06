import express from "express";
import multer from "multer";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
import Image from "../models/Image.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// S3 config


const getS3 = () =>
  new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY
    }
  });


// 📤 Upload Image
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    const key = Date.now() + "-" + file.originalname;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    });

    const s3 = getS3();

    const ans = await s3.send(command);
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${key}`;



    // 💾 save in DB
    const newImage = await Image.create({ imageUrl });

    res.json(newImage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 📥 Get all images
router.get("/images", async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ❌ Delete image (DB + S3)
router.delete("/image/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ msg: "Not found" });

    // extract key from URL
    const key = image.imageUrl.split(".com/")[1];
    const s3 = getS3();
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
      })
    );

    await image.deleteOne();

    res.json({ msg: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;