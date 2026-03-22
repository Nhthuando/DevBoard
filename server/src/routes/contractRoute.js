import express from "express";
import { verifyToken } from "../middlewares/authenMiddleware.js";
import { authorize } from "../middlewares/authorMiddleware.js";
import {createContract,getContracts} from "../controllers/contractController.js";

const router = express.Router();

router.post("/from-proposal/:proposalId", verifyToken, authorize("CLIENT"),createContract );
router.get("/me", verifyToken, getContracts);


export default router;