import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    paymentDate: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["Credit Card", "Debit Card", "Net Banking", "UPI", "Wallet"],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["Success", "Failed"],
        required: true
    },
    amount: {
        type: Float,
        required: true
    }
},{timestamps: true
});


export const Payment = mongoose.model('Payment', paymentSchema);
