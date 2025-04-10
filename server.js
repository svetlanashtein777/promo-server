import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB подключение
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Cloudinary настройки
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'promo_upload',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

// Схема MongoDB
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  link: String,
  price: Number,
  visible: { type: Boolean, default: true },
  images: [String]
});

const Product = mongoose.model('Product', productSchema);

// Загрузка товара
app.post('/products', upload.array('images'), async (req, res) => {
  try {
    const imageUrls = req.files.map(file => file.path);
    const product = await Product.create({
      ...req.body,
      images: imageUrls
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при создании товара' });
  }
});

// Получение всех товаров
app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Удаление
app.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Редактирование
app.put('/products/:id', async (req, res) => {
  const
