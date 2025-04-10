import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

// Schema for products
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  link: String,
  visible: Boolean,
  images: [String],
});

const Product = mongoose.model('Product', productSchema);

// Schema for promo codes
const promoSchema = new mongoose.Schema({
  text: String,
  promo_code: String,
  image_url: String,
  expires_at: Date,
});

const Promo = mongoose.model('Promo', promoSchema);

// Product routes
app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/products', upload.array('images', 10), async (req, res) => {
  const { name, description, price, link } = req.body;
  const images = req.files.map((file) => file.path);

  const product = new Product({
    name,
    description,
    price,
    link,
    visible: true,
    images,
  });

  await product.save();
  res.json({ message: 'Product created', product });
});

app.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

app.put('/products/:id', async (req, res) => {
  const { name, description, price, link } = req.body;
  await Product.findByIdAndUpdate(req.params.id, { name, description, price, link });
  res.json({ message: 'Product updated' });
});

app.patch('/products/:id', async (req, res) => {
  const { visible } = req.body;
  await Product.findByIdAndUpdate(req.params.id, { visible });
  res.json({ message: 'Visibility updated' });
});

// Promo route
app.post('/promo', async (req, res) => {
  try {
    const { text, promo_code, image_url, expires_at } = req.body;

    const promo = new Promo({
      text,
      promo_code,
      image_url,
      expires_at,
    });

    await promo.save();
    res.status(201).json({ message: 'Промокод сохранён', promo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при сохранении промокода' });
  }
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
