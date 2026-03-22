
import prisma from "../lib/prisma.js";
import {applyJobSchemaBody, applyJobSchemaParams, getJobDetailSchema, getJobSchema, getProposalsSchema, jobSchema} from "../validator/jobValidator.js"
import {includes, z} from "zod";

export const createJob = async (req,res) =>{
    try {
        if (!req.user) return res.status(401).json({ message: "Chưa xác thực!" });
        const result = jobSchema.safeParse(req.body);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const ownerId = req.user.userId;
        if(!ownerId) return res.status(401).json({message: "Không lấy được OwnerId!"});
        const {skillsRequired,...rest} = result.data;
        const skillRecords = await Promise.all(skillsRequired.map((name) => {
            const nomarlize = name.toUpperCase().trim();
            return prisma.skills.upsert({where: {name: nomarlize}, update: {}, create: {name: nomarlize}});
        }
    )
    );
        const job = await prisma.jobs.create({data: {...rest,jobSkills: {create: skillRecords.map((skill) => ({skillId: skill.id}))} ,clientId: ownerId, status: "OPEN"}});
        return res.status(201).json({job});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Có lỗi server!"});
    }
}

export const getAllJobs = async (req,res) =>{
    try {
        const result = getJobSchema.safeParse(req.query);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const where = {status: "OPEN"};
        const {page,limit,search, budgetMin,budgetMax,skills,sortBy,sortOrder} = result.data;
        if (search) where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
        ];
        if(budgetMin !== undefined) where.budgetMin = {gte : budgetMin};
        if(budgetMax !== undefined) where.budgetMax = {lte : budgetMax};
        if(skills) {
            const skillsArray = skills.split(',').map((x) => x.trim().toUpperCase());
            where.jobSkills = {some: {skills: {name: { in: skillsArray }}}};
        }
        const skip = (page-1)*limit;
        const orderBy = { [sortBy] : sortOrder};
        const [items,totalItems] = await Promise.all([
            prisma.jobs.findMany({where,skip,orderBy, take: limit}),
            prisma.jobs.count({where})
        ])
        const totalPages = Math.ceil(totalItems / limit);
        return res.status(200).json({items, pagination: {page,limit,totalItems,totalPages}})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}

export const getJobDetail = async (req,res) => {
    try {
        const result = getJobDetailSchema.safeParse(req.params);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {jobId} = result.data;
        const job = await prisma.jobs.findFirst({where: {id: jobId, status: "OPEN"}, 
            include: {jobSkills: {
                include: { skills: {
                    select: {name: true}}}
            }, users: {select: {
                id: true, name: true, avatarUrl: true
            }}}});
        if (!job) return res.status(404).json({ message: "Không tìm thấy job!" });
        const {jobSkills, ...rest} = job;
        const skillsArray = jobSkills.map((e) => e.skills.name);
        return res.status(200).json({...rest, skillsArray});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}

export const applyJob = async(req,res) =>{
    try {
        if (!req.user) return res.status(401).json({ message: "Chưa xác thực!" });
        const devId = req.user.userId;
        if(!devId) return res.status(401).json({message: "Không lấy được devId!"});
        const resultParams = applyJobSchemaParams.safeParse(req.params);
        if(!resultParams.success) return res.status(400).json({error: z.flattenError(resultParams.error)});
        const resultBody = applyJobSchemaBody.safeParse(req.body);
        if(!resultBody.success) return res.status(400).json({error: z.flattenError(resultBody.error)});
        const {jobId} = resultParams.data;
        const {coverLetter,bidAmount} = resultBody.data;
        const job = await prisma.jobs.findFirst({where: {id: jobId, status: "OPEN"}});
        if(!job) return res.status(404).json({message: "Không tìm thấy job!"});
        if(job.clientId === devId) return res.status(403).json({message: "Không thể self-apply!"});
        const existProposal = await prisma.proposals.findFirst({where: {devId: devId, jobId: jobId}});
        if(existProposal) return res.status(409).json({message: "Chỉ có thể apply job 1 lần!"});
        const proposal = await prisma.proposals.create({data: {jobId: jobId, devId: devId, coverLetter: coverLetter,bidAmount: bidAmount, status: "PENDING"}})
        return res.status(201).json({proposal});
    } catch (error) {
        if (error.code === "P2002") 
        return res.status(409).json({ message: "Bạn đã apply job này rồi!" });
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}

export const getProposals = async (req,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không thể xác thực user!"});
        const clientId = req.user.userId;
        if(!clientId) return res.status(401).json({message: "Không thể lấy client id!"});
        const result = getProposalsSchema.safeParse(req.params);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {jobId} = result.data;
        const job = await prisma.jobs.findFirst({where: {id: jobId}});
        if(!job) return res.status(404).json({message: "Không tìm thấy job!"});
        if(job.clientId !== clientId) return res.status(403).json({message: "User không phải chủ sở hữu của job!"});
        const proposals = await prisma.proposals.findMany({where: {jobId: jobId}, orderBy: {createdAt: "desc"}, select: {id:true, coverLetter: true, bidAmount: true, status: true, createdAt : true, users: { select: {id: true, name: true, avatarUrl: true }}} });
        if(proposals.length === 0) return res.status(404).json({message: "Không tìm thấy proposal!"});
        return res.status(200).json({proposals});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Có lỗi server!"});
    }
}

export const closeJob = async(req,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không thể xác thực user!"});
        const clientId = req.user.userId;
        if(!clientId) return res.status(401).json({message: "Không thể lấy client id!"});
        const result = getProposalsSchema.safeParse(req.params);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {jobId} = result.data;
        const job = await prisma.jobs.findUnique({where: {id: jobId}, include: {proposals : {select: {status : true}}} });
        if(!job) return res.status(404).json({message: "Không tìm thấy job!"});
        if(job.clientId !== clientId) return res.status(403).json({message: "User không phải chủ job!"});
        if(job.status !== "OPEN") return res.status(409).json({message: "Job đang không open!"});
        if(!job.proposals.some((x) => x.status === "ACCEPTED")) return res.status(409).json({message: "Không có proposal nào đang ACCEPTED!"});
        const updtJob = await prisma.jobs.update({where: {id: jobId}, data: {status: "IN_PROGRESS"}, select: {clientId: true, id:true, status: true, createdAt: true}})
        return res.status(200).json({updtJob});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}