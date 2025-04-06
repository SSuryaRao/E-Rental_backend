import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from '../middlewares/multer.middleware.js';
import { registerProduct } from "../controllers/product.controller.js";

const router=Router();

//Secured Routes
router.route("/register-product").post(verifyJWT,upload.fields([
    {
        name:"image",
        maxCount: 5
    }
]),registerProduct)



export { router as productRouter };