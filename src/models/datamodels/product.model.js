import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    sellerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller'
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    categoryID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    image:{
        type: String
    }

},{timestamps: true});


export const Product = mongoose.model('Product', productSchema)