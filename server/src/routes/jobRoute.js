import express from "express";
import { verifyToken } from "../middlewares/authenMiddleware.js";
import {authorize } from "../middlewares/authorMiddleware.js"
import { createJob,getAllJobs } from "../controllers/jobController.js";

const router = express.Router();

router.post("/createJob", verifyToken, authorize("CLIENT"), createJob);
router.get("/listJobs",getAllJobs);

export default router;