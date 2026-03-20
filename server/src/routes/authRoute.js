import express from "express";
import {login,register,getMe} from "../controllers/authController.js"
import { verifyToken } from "../middlewares/authenMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);


export default router;