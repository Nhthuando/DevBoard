import express from "express";
import { markAsRead, getNotification } from "../controllers/notificationController.js";
import { verifyToken } from "../middlewares/authenMiddleware.js";

const router = express.Router();

router.get("/me", verifyToken, getNotification);
router.patch("/:notificationId/read", verifyToken, markAsRead);

export default router;
