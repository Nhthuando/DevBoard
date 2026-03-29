import express from "express";
import { verifyToken } from "../middlewares/authenMiddleware.js";
import { authorize } from "../middlewares/authorMiddleware.js";
import { updateProposalStatus, getDevProposals, setWithdrawStatus} from "../controllers/proposalController.js";
import {uploadAttachment, deleteAttachment, getAttachments} from "../controllers/uploadController.js"
import upload from "../middlewares/uploadMiddleware.js";


const router = express.Router();

router.patch("/:proposalId/status", verifyToken, authorize("CLIENT"), updateProposalStatus );
router.get("/me", verifyToken, authorize("DEV"), getDevProposals);
router.patch("/:proposalId/withdraw",verifyToken,authorize("DEV"), setWithdrawStatus );
router.post("/:proposalId/attachments", verifyToken, authorize("DEV"),upload.single("file"),uploadAttachment);
router.delete("/attachments/:attachmentId", verifyToken, authorize("DEV"),deleteAttachment);
router.get("/:proposalId/attachments", verifyToken, getAttachments);

export default router;