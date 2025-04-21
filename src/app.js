import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { paymentRouter } from './routes/payment.routes.js';
import { userRouter } from './routes/user.routes.js';
import { sellerRouter } from './routes/seller.routes.js';
import { productRouter } from './routes/product.routes.js';
import { cartRouter } from './routes/cart.routes.js';

const app = express();

// Middleware
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ CORS Config
const allowedOrigins = process.env.ORIGIN_URL
  ? process.env.ORIGIN_URL.split(',')
  : ['http://localhost:5173']; // React default port

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ API Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/seller', sellerRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/payments', paymentRouter);

export { app };
