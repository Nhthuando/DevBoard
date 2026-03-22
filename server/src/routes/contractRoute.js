import express from "express";
import { verifyToken } from "../middlewares/authenMiddleware.js";
import { authorize } from "../middlewares/authorMiddleware.js";
import {createContract} from "../controllers/contractController.js";

const router = express.Router();

router.post("/from-proposal/:proposalId", verifyToken, authorize("CLIENT"),createContract );

export default router;