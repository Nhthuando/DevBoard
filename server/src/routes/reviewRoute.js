import express from "express";
import { createReview, getDevReviews,getReview, getReviewMe} from "../controllers/reviewController.js";
import { verifyToken } from "../middlewares/authenMiddleware.js";
import { authorize } from "../middlewares/authorMiddleware.js";

const router = express.Router();

router.post("/contracts/:contractId", verifyToken, authorize("CLIENT"), createReview);
router.get("/dev/:devId",getDevReviews);
router.get("/contract/:contractId", verifyToken,getReview);
router.get("/me", verifyToken, getReviewMe);

export default router;