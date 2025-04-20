import mongoose from "mongoose";    


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports','Games','TV','Fridge','Furniture'],
        unique: true
    }
});

export const Category = mongoose.model('Category', categorySchema);