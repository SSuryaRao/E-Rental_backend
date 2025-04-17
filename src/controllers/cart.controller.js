import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Cart } from "../models/datamodels/cart.model.js";
import { Product } from "../models/datamodels/product.model.js";


const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userDetails = req.user;

    if (!productId || !quantity) {
        throw new ApiError(400, "All the fields are required");
    }

    if (!userDetails) {
        throw new ApiError(401, "Unauthorized: Error in fetching user details");
    }

    const userId = userDetails._id;

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    if (cart) {
        // Cart exists, check if the product is already in the cart
        const itemIndex = cart.items.findIndex(item => item.productID.toString() === productId);

        if (itemIndex > -1) {
            // Product exists, update the quantity
            cart.items[itemIndex].quantity += parseInt(quantity);
        } else {
            // Product doesn't exist, add it to the items array
            cart.items.push({ productID: productId, quantity: parseInt(quantity) });
        }
        await cart.save();
        return res
            .status(200)
            .json(new ApiResponse(200, "Product added to cart successfully", cart));

    } else {
        // Cart doesn't exist, create a new cart
        const newCart = await Cart.create({
            userId: userId,
            items: [{ productID: productId, quantity: parseInt(quantity) }]
        });

        if (!newCart) {
            throw new ApiError(500, "Error in creating the cart");
        }

        return res
            .status(201)
            .json(new ApiResponse(201, "Product added to cart successfully", newCart));
    }
});


const getCart = asyncHandler(async (req, res) => {
    const userDetails = req.user;
  
    if (!userDetails) {
      throw new ApiError(401, "Unauthorized: User not found");
    }
  
    const userId = userDetails._id;
  
    const cart = await Cart.findOne({ userId }).populate("items.productID");
  
    if (!cart || cart.items.length === 0) {
      return res.status(200).json(new ApiResponse(200, "Cart is empty", []));
    }
  
    const formattedCart = cart.items.map(item => ({
      productId: item.productID._id,
      productName: item.productID.name,
      productImage: item.productID.image,
      price: item.productID.price,
      quantity: item.quantity
    }));
  
    return res.status(200).json(new ApiResponse(200, "Cart fetched successfully", formattedCart));
  });
  

export { addToCart, getCart };