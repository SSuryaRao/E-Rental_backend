import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app=express();



app.use(express.json({limit: '20kb'}));
app.use(express.urlencoded({extended: true,limit: '20kb'}));
app.use(express.static("public"));
app.use(cookieParser());
const allowedOrigins = process.env.ORIGIN_URL.split(',');

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// routes
import { userRouter } from './routes/user.routes.js';
import { sellerRouter } from './routes/seller.routes.js';
import { productRouter } from './routes/product.routes.js';
import { cartRouter } from './routes/cart.routes.js';

app.use('/api/v1/user',userRouter);
app.use('/api/v1/seller',sellerRouter);
app.use('/api/v1/product',productRouter);
app.use('/api/v1/cart',cartRouter);


export { app }
