import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app=express();



app.use(express.json({limit: '20kb'}));
app.use(express.urlencoded({extended: true,limit: '20kb'}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({
    origin: process.env.ORIGIN_URL,
    credentials: true
}))
// routes
import { userRouter } from './routes/user.routes.js';


app.use('/api/v1/user',userRouter);

export { app }