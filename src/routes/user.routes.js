import {Router} from 'express';
import { loginUser, logoutUser, registerUser ,refreshAccessToken, changePassword} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

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

router.route("/login").post(loginUser);


//secured routes
router.route("/logout").post(verifyJWT ,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changePassword);


// In user.routes.js, add this test route
router.get("/test", (req, res) => {
    res.status(200).json({ message: "Test route works!" });
});

export { router as userRouter };