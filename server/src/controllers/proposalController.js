import prisma from "../lib/prisma.js";
import { updateProposalStatusSchema,proposalIdValidator, getDevProposalsSchema } from "../validator/proposalValidator.js";
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
        if(proposal.jobs.clientId !== clientId ) return res.status(403).json({message: "Job không thuộc về client!"});
        if(proposal.jobs.status !== "OPEN") return res.status(409).json({message: "Job không ở trạng thái OPEN!"});
        if(proposal.status === "ACCEPTED" || proposal.status === "REJECTED") return res.status(409).json({message: "Proposal đã ở trạng thái cuối!"});
        const {status} = resultBody.data;
        const updtProposal = await prisma.proposals.update({where: {id: proposalId}, data: {status: status}});
        return res.status(200).json({updtProposal});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}

export const getDevProposals = async (req,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không thể xác thực user!"});
        const devId = req.user.userId;
        if(!devId) return res.status(401).json({message: "Không thể lấy id user!"});
        const result = getDevProposalsSchema.safeParse(req.query);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {status, page, limit, sortOrder} = result.data;
        const where = {devId: devId};
        if(status) where.status = status;
        const orderBy = {createdAt: sortOrder}
        const skip = (page-1)*limit;
        const [items, totalItems] = await Promise.all([
            prisma.proposals.findMany({where,skip,orderBy,take: limit, include: {jobs: {select: {id: true, title:true, budgetMin: true, budgetMax: true, status: true}}}}),
            prisma.proposals.count({where})
        ])
        const totalPages = Math.ceil(totalItems/limit);
        return res.status(200).json({items, pagination: {page, limit, totalItems, totalPages}})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}

export const setWithdrawStatus = async(req,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không xác thực được user!"});
        const devId = req.user.userId;
        if(!devId) return res.status(401).json({message: "Không lấy được dev id!"});
        const result = proposalIdValidator.safeParse(req.params);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {proposalId} = result.data;
        const proposal = await prisma.proposals.findUnique({where: {id: proposalId}});
        if(!proposal) return res.status(404).json({message: "Không tìm thấy proposal!"});
        if(proposal.devId !== devId) return res.status(403).json({message: "Proposal không thuộc về dev!"});
        if(proposal.status !== "PENDING") return res.status(409).json({message: "Proposal không cho withdraw!"});
        const updtProposal = await prisma.proposals.update({where: {id: proposalId}, data: {status: "WITHDRAWN"}, select: {id:true, jobId: true, devId: true, createdAt: true, status: true}});
        return res.status(200).json({updtProposal})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
} 