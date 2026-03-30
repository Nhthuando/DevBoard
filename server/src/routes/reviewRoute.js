import express from "express";
import { createReview, getDevReviews } from "../controllers/reviewController.js";
import { verifyToken } from "../middlewares/authenMiddleware.js";
import { authorize } from "../middlewares/authorMiddleware.js";

const router = express.Router();

router.post("/contracts/:contractId", verifyToken, authorize("CLIENT"), createReview);
router.get("/dev/:devId",getDevReviews);
export default router;