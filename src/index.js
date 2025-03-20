import dotenv from 'dotenv';
import connectDB from './db/db.js';
import express from 'express';

dotenv.config({
    path: './env'
})

const app = express();


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
    app.on("error", (error) => {
        console.log("error in the server ",error);
        throw error;
    })
})
.catch((err) => {
    console.log("Error in mongo db connection", err);   
})

app.get('/', (req,res) => {
    res.send(`server is running on port ${process.env.PORT || 8000}`);
})