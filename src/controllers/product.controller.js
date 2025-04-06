import { asyncHandler } from "../utils/asyncHandler.js";
import { Seller } from "../models/datamodels/seller.model.js";

const registerProduct = asyncHandler(async (req,res) => {
    const { sellerEmail, name, description, price, stock, category }= req.body
    if(!sellerEmail || !name || !description || !price || !stock || !category ){
        throw new ApiError(400,"All fields are required ")
    }
    const seller = Seller.findOne(sellerEmail)


})