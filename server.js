import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'promo_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Promo = mongoose.model('Promo', new mongoose.Schema({
  text: String,
  promo_code: String,
  image_url: String,
  expires_at: Date
}));

app.post('/promo', upload.single('image'), async (req, res) => {
  try {
    const { text, promo_code, valid_days } = req.body;
    const expires_at = new Date(Date.now() + parseInt(valid_days) * 86400000);
    const image_url = req.file.path;

    const promo = await Promo.create({ text, promo_code, image_url, expires_at });
    res
