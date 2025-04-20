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

const productDetails = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    

    if (!name && !description) {
        throw new ApiError(400, "at least one field is required");
    }

    const queryConditions = [];

    if (name && typeof name === "string") {
        queryConditions.push({ name: { $regex: name, $options: "i" } });
    }

    if (description && typeof description === "string") {
        queryConditions.push({
            description: { $regex: description, $options: "i" },
        });
    }

    const products = await Product.find({ $or: queryConditions })
        .populate("categoryID", "name")
        .populate("sellerID", "storeName gstNumber address")
        .exec();

    return res
        .status(200)
        .json(new ApiResponse(200, "product fetched successfully", products));
});

const allProducts = asyncHandler(async(req,res) =>{
    const products = await Product.find({})
    .populate("categoryID", "name")
    .populate("sellerID", "storeName gstNumber address")
    .exec();
    

    // async function seedCategories() {
    //     const predefinedCategories = ['Electronics', 'TV','Fridge','Furniture'];
    
    //     // Check if any of the predefined categories are missing
    //     const existingCategories = await Category.find({ name: { $in: predefinedCategories } }).select('name');
    //     const existingNames = existingCategories.map(cat => cat.name);
    
    //     const categoriesToInsert = predefinedCategories.filter(name => !existingNames.includes(name));
    
    //     if (categoriesToInsert.length === 0) {
    //         console.log('All predefined categories already exist. Skipping seeding.');
    //         return;
    //     }
    
    //     // Insert the missing categories
    //     for (const name of categoriesToInsert) {
    //         await Category.create({ name });
    //         console.log(`Inserted category: ${name}`);
    //     }
    // }
    
    // seedCategories();




    return res
    .status(200)
    .json(new ApiResponse(200,"All the products fetched successfully", products))
})

const productByID = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get product ID from URL parameters

    if (!id) {
        throw new ApiError(400, "Product ID is required.");
    }

    const product = await Product.findById(id)
        .populate("categoryID", "name")
        .populate("sellerID", "storeName gstNumber address")
        .exec();

    if (!product) {
        throw new ApiError(404, "Product not found.");
    }

    return res.status(200).json(new ApiResponse(200, "Product fetched successfully", product));
});

const deleteProduct = asyncHandler(async(req,res) =>{
    const {productId} = req.params;

    if(!productId){
        throw new ApiError(404,"productId is required ")
    }
    const product = await Product.findByIdAndDelete(productId)

    if(!product){
        throw new ApiError(404,"product not found or error in deleting from database ")
    }
    await Cart.updateMany(
        {},
        { $pull: { items: { productID: productId } } }
      );
      return res.status(200).json(
        new ApiResponse(200, "Product deleted and removed from all carts")
      );
})

export { registerProduct, productDetails, allProducts, productByID, deleteProduct };
