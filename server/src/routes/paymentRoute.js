import express from "express";
import { verifyToken } from "../middlewares/authenMiddleware.js";
import { authorize } from "../middlewares/authorMiddleware.js";
import {createPayment, releasePayment, checkoutStripe} from "../controllers/paymentController.js"

const router = express.Router();

router.post("/contract/:contractId", verifyToken, authorize("CLIENT"),createPayment );
router.patch("/:paymentId/release", verifyToken, authorize("CLIENT"),releasePayment);
router.post("/:paymentId/checkout", verifyToken, authorize("CLIENT"), checkoutStripe);


export default router;