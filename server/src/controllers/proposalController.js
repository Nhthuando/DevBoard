
import prisma from "../lib/prisma.js";
import { updateProposalStatusSchema,proposalIdValidator } from "../validator/proposalValidator.js";
import {z} from "zod";


export const updateProposalStatus = async (req,res) =>{
    try {
        if(!req.user) return res.status(401).json({message: "Không thể xác thực user!"});
        const clientId = req.user.userId;
        if(!clientId) return res.status(401).json({message: "Không thể lấy client Id!"});
        const resultParams = proposalIdValidator.safeParse(req.params);
        if(!resultParams.success) return res.status(400).json({error: z.flattenError(resultParams.error)});
        const resultBody = updateProposalStatusSchema.safeParse(req.body);
        if(!resultBody.success) return res.status(400).json({error: z.flattenError(resultBody.error)});
        const {proposalId} = resultParams.data;
        const proposal = await prisma.proposals.findFirst({where: {id: proposalId}, include: {jobs: {select: {clientId: true, status: true}}}  })
        if(!proposal) return res.status(404).json({message: "Không tìm thấy proposal!"});
        if(proposal.jobs.status !== "OPEN") return res.status(409).json({message: "Job không ở trạng thái OPEN!"});
        if(proposal.jobs.clientId !== clientId ) return res.status(403).json({message: "Job không thuộc về client!"});
        if(proposal.status === "ACCEPTED" || proposal.status === "REJECTED") return res.status(409).json({message: "Proposal đã ở trạng thái cuối!"});
        const {status} = resultBody.data;
        const updtProposal = await prisma.proposals.update({where: {id: proposalId}, data: {status: status}});
        return res.status(200).json({updtProposal});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}
