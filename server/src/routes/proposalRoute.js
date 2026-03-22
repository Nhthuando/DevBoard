import express from "express";
import { verifyToken } from "../middlewares/authenMiddleware.js";
import { authorize } from "../middlewares/authorMiddleware.js";
import { updateProposalStatus, getDevProposals, setWithdrawStatus} from "../controllers/proposalController.js";
const router = express.Router();

router.patch("/:proposalId/status", verifyToken, authorize("CLIENT"), updateProposalStatus );
router.get("/me", verifyToken, authorize("DEV"), getDevProposals);
router.patch("/:proposalId/withdraw",verifyToken,authorize("DEV"), setWithdrawStatus );
export default router;