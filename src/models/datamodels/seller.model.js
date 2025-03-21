import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
},{timestamps: true});


export const Seller = mongoose.model('Seller', sellerSchema)