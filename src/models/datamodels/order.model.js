import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        required: true,
        default: "Pending"
    },
    totalAmount: {
        type: Number,
        required: true
    },
    
});


export const Order = mongoose.model('Order', orderSchema);
