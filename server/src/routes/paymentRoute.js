import express from "express";
import { verifyToken } from "../middlewares/authenMiddleware.js";
import { authorize } from "../middlewares/authorMiddleware.js";
import {createPayment,changePaymentStatus, releasePayment} from "../controllers/paymentController.js"

const router = express.Router();

router.post("/contract/:contractId", verifyToken, authorize("CLIENT"),createPayment );
router.patch("/:paymentId/mark-escrowed", verifyToken, authorize("CLIENT"), changePaymentStatus);
router.patch("/:paymentId/release", verifyToken, authorize("CLIENT"),releasePayment);

export default router;