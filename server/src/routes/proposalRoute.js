import express from "express";
import { verifyToken } from "../middlewares/authenMiddleware.js";
import { authorize } from "../middlewares/authorMiddleware.js";
import { updateProposalStatus } from "../controllers/proposalController.js";
const router = express.Router();

router.patch("/:proposalId/status", verifyToken, authorize("CLIENT"), updateProposalStatus );

export default router;