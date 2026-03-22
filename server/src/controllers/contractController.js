import prisma from "../lib/prisma.js";
import {z} from "zod"
import {proposalIdValidator} from "../validator/proposalValidator.js"
import {getContractSchema} from "../validator/contractValidator.js"


export const createContract = async (req,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không thể xác thực user!"});
        const clientId = req.user.userId;
        if(!clientId) return res.status(401).json({message: "Không thể lấy client id!"});
        const result = proposalIdValidator.safeParse(req.params);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {proposalId} = result.data;
        const proposalContract = await prisma.contracts.findFirst({where: {proposalId: proposalId}});
        if(proposalContract) return res.status(409).json({message: "Proposal đã có contract!"});
        const proposal = await prisma.proposals.findUnique({where: {id: proposalId}, include: {jobs: {select : {id: true, clientId: true}}}})
        if(!proposal) return res.status(404).json({message: "Không tìm thấy proposal!"});
        const jobContract = await prisma.contracts.findFirst({where: {jobId: proposal.jobId}});
        if(jobContract) return res.status(409).json({message: "Job đã có contract!"});
        if(proposal.status !== "ACCEPTED") return res.status(409).json({message: "Status của proposal phải là ACCEPTED!"});
        if(proposal.jobs.clientId !== clientId) return res.status(403).json({message : "Job không thuộc về client!"});
        const contract = await prisma.contracts.create({data: {jobId: proposal.jobId, proposalId: proposal.id, clientId: proposal.jobs.clientId, devId: proposal.devId, agreedAmount: proposal.bidAmount, status: "ACTIVE"}});
        return res.status(201).json({contract})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}

export const getContracts = async (req,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không thể xác thực user!"});
        const userId = req.user.userId;
        if(!userId) return res.status(401).json({message: "Không thể lấy user id!"});
        const userRole = req.user.role;
        if(!userRole) return res.status(401).json({message: "Không thể lấy role user!"});
        const result = getContractSchema.safeParse(req.query);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {status, page, limit, sortOrder} = result.data;
        const where = {};
        if(status) where.status = status;
        const skip  = (page-1)*limit;
        const orderBy = {createdAt: sortOrder};
        if(userRole === "CLIENT" ) {
            where.clientId = userId;
            const [items,totalItems] = await Promise.all([
                prisma.contracts.findMany({where,skip,orderBy,take: limit, select: {id: true, status: true, agreedAmount: true, createdAt: true, jobs: {select: {id: true, title: true}}, users_contracts_devIdTousers  : {select : {id: true, name: true, avatarUrl: true}} }}),
                prisma.contracts.count({where})
            ])
            const totalPages = Math.ceil((totalItems/limit));
            return res.status(200).json({items, pagination: {page, limit, totalItems, totalPages}});
        }
        else if(userRole === "DEV"){
            where.devId = userId;
            const [items,totalItems] = await Promise.all([
                prisma.contracts.findMany({where,skip,orderBy,take: limit, select: {id: true, status: true, agreedAmount: true, createdAt: true, jobs: {select: {id: true, title: true}}, users_contracts_clientIdTousers : {select : {id: true, name: true, avatarUrl: true}} }}),
                prisma.contracts.count({where})
            ])
            const totalPages = Math.ceil((totalItems/limit));
            return res.status(200).json({items, pagination: {page, limit, totalItems, totalPages}});
        }
        else return res.status(403).json({message: "Role không hợp lệ!"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}