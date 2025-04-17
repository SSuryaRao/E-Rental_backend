import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addToCart, getCart } from "../controllers/cart.controller.js";


const router = Router();



//Secured routes
router.route("/add-to-cart").post(verifyJWT,addToCart)
router.route("/get-cart").get(verifyJWT,getCart)

export { router as cartRouter};