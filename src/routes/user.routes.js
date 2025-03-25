import {Router} from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser
    )

// In user.routes.js, add this test route
router.get("/test", (req, res) => {
    res.status(200).json({ message: "Test route works!" });
});

export { router as userRouter };