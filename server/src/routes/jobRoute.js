import express from "express";
import { verifyToken } from "../middlewares/authenMiddleware.js";
import {authorize } from "../middlewares/authorMiddleware.js"
import { createJob } from "../controllers/jobController.js";

const router = express.Router();

router.post("/createJob", verifyToken, authorize("CLIENT"), createJob);

export default router;