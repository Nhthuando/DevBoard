import express from "express";
import { verifyToken } from "../middlewares/authenMiddleware.js";
import {authorize } from "../middlewares/authorMiddleware.js"
import { createJob,getAllJobs, getJobDetail, applyJob } from "../controllers/jobController.js";

const router = express.Router();

router.post("/createJob", verifyToken, authorize("CLIENT"), createJob);
router.get("/listJobs",getAllJobs);
router.get("/:jobId", getJobDetail);
router.post("/proposal/:jobId", verifyToken, authorize("DEV"), applyJob);

export default router;