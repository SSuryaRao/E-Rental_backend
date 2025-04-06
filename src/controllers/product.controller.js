import { asyncHandler } from "../utils/asyncHandler.js";
import { Seller } from "../models/datamodels/seller.model.js";
import { Product } from "../models/datamodels/product.model.js";
import { Category } from "../models/datamodels/category.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import fs from "fs";

const registerProduct = asyncHandler(async (req, res) => {
    const userDetails = req.user;
    // async function seedCategories() {
    //     const predefinedCategories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Games'];
    //     for (const name of predefinedCategories) {
    //         const exists = await Category.findOne({ name });
    //         if (!exists) {
    //             await Category.create({ name });
    //             console.log(`Inserted category: ${name}`);
    //         }
    //     }
    // }

    // seedCategories();
    const imageLocalPath = req.files?.image?.[0]?.path;
    if (!imageLocalPath) {
        throw new ApiError(400, "no image local path found");
    }
    const { name, description, price, stock, category } = req.body;
    if (!name || !description || !price || !stock || !category) {
        throw new ApiError(400, "All fields are required ");
    }
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
        try {
            if (fs.existsSync(imageLocalPath)) {
                fs.unlinkSync(imageLocalPath);
            }
        } catch (err) {
            console.error("Error deleting local image:", err);
        }

        throw new ApiError(400, "Product already exists");
    }

    const categoryDetails = await Category.findOne({ name: category });
    if (!categoryDetails) {
        throw new ApiError(400, "invalid category or category does not exist");
    }
    const categoryID = categoryDetails._id;
    const sellerID = userDetails.sellerID;
    if (!sellerID) {
        throw new ApiError(400, "Seller is not registered ");
    }

    const image = await uploadToCloudinary(imageLocalPath);
    if (!image) {
        throw new ApiError(500, "image failed to upload on cloudinary");
    }
    const product = await Product.create({
        sellerID,
        name,
        description,
        price,
        stock,
        categoryID,
        image: image.url,
    });

    if (!product) {
        throw new ApiError(
            500,
            "Failed to register the product on the database"
        );
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Product registered successfully", product));
});

export { registerProduct };
