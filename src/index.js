import dotenv from 'dotenv';
import connectDB from './db/db.js';



connectDB();

dotenv.config({
    path: './env'
})
