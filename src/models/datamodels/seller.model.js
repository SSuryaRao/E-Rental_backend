import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
    storeName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    gstNumber: {
        type: String,
        required: true
    }
},{timestamps: true});


export const Seller = mongoose.model('Seller', sellerSchema)