
import mongoose from 'mongoose';
import {DB_NAME} from '../constants.js';


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, );
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
        // error finding
    } catch (error) {
        console.log("MongoDB connection failed ",error); 
        process.exit(1);
    }
}


export default connectDB





// import mongoose from 'mongoose';

// // Your connection URI (make sure to hide this in environment variables for production)
// const uri = "mongodb+srv://rental:<db_password>@cluster0.dm6a4.mongodb.net/?appName=cluster0";

// // Connect to MongoDB using Mongoose
// try {
//   await mongoose.connect(uri, {
//     // Mongoose connection options
//     serverSelectionTimeoutMS: 5000,
//     socketTimeoutMS: 45000,
//   });
//   console.log('Connected to MongoDB successfully!');
// } catch (err) {
//   console.error('Could not connect to MongoDB:', err);
// }




// import { MongoClient } from "mongodb";
// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";

// const uri = process.env.MONGODB_URI; // Get MongoDB URI from .env
// const client = new MongoClient(uri, { useUnifiedTopology: true });

// const connectDB = async () => {
//     try {
//         // Connect using MongoClient first
//         await client.connect();
//         console.log("✅ Connected to MongoDB using MongoClient");

//         // Pass the MongoClient's connection to Mongoose
//         const mongooseConnection = await mongoose.connect(uri, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             serverSelectionTimeoutMS: 5000,
//         });

//         console.log(`✅ MongoDB connected using Mongoose: ${mongooseConnection.connection.host}`);
//     } catch (error) {
//         console.error("❌ MongoDB connection failed:", error);
//         process.exit(1);
//     }
// };

// export default connectDB;

