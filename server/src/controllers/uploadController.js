import prisma from "../lib/prisma.js";
import { proposalIdValidator, attachmentIdValidator, pagination } from "../validator/proposalValidator.js";
import {z} from "zod";
import cloudinary from "../lib/cloudinary.js";

export const uploadAttachment = async(req , res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không thể xác thực user!"});
        const userId = req.user.userId ;
        if(!userId) return res.status(401).json({message: "Không thể lấy userId"});
        const result = proposalIdValidator.safeParse(req.params);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {proposalId} = result.data;
        if(!req.file) return res.status(400).json({message: "Không tìm thấy file!"});
        const proposal = await prisma.proposals.findUnique({where: {id: proposalId}});
        if(!proposal) return res.status(404).json({message: "Không tìm thấy proposal"});
        if(proposal.devId !== userId) return res.status(403).json({message: "Proposal không thuộc về user!"});
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: "devboard/attachments" },
                (error, result) => {
                    if(error) reject(error);
                    else resolve(result);
                }
            ).end(req.file.buffer);
        });
        const attachment = await prisma.proposalAttachments.create({
            data: {
                proposalId,
                fileUrl: uploadResult.secure_url,
                fileName: req.file.originalname,
                fileSize: req.file.size
            }
        });
        return res.status(201).json({ attachment });
    } catch (error) {
        if(error.http_code) {
            console.error("[Upload] Cloudinary lỗi:", error.message);
            return res.status(500).json({ message: "Lỗi upload file!" });
        }
        console.log(error);
        return res.status(500).json({message : "Có lỗi server!"});
    }
}


export const deleteAttachment = async(req,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không thể xác thực user!"});
        const userId = req.user.userId ;
        if(!userId) return res.status(401).json({message: "Không thể lấy userId"});
        const result = attachmentIdValidator.safeParse(req.params);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {attachmentId} = result.data;
        const attachment = await prisma.proposalAttachments.findUnique({where: {id: attachmentId}, include: {proposals: {select: {devId: true}}}});
        if(!attachment) return res.status(404).json({message: "Không tìm thấy attachment!"});
        if(attachment.proposals.devId !== userId) return res.status(403).json({message: "Attachment k thuộc về user!"});
        const extractPublicId = (fileUrl) => {
            const parts = fileUrl.split("/");
            const uploadIndex = parts.indexOf("upload");
            const afterUpload = parts.slice(uploadIndex + 1);
            const withoutVersion = afterUpload[0]?.match(/^v\d+$/) 
                ? afterUpload.slice(1) 
                : afterUpload;
            const withExt = withoutVersion.join("/");
            return withExt.replace(/\.[^/.]+$/, ""); 
        }
        const publicId = extractPublicId(attachment.fileUrl);
        const cloudinaryResult = await new Promise((resolve,reject) => {
        cloudinary.uploader.destroy(
            publicId,
            {resource_type: "auto"},
            (error,result) => {
                if(error) reject(error);
                else resolve(result);
            }
        )
        })
        if(cloudinaryResult.result !== "ok" && cloudinaryResult.result !== "not found") {
            console.error(`[Delete] Cloudinary lỗi | attachmentId: ${attachmentId}`);
            return res.status(500).json({message: "Lỗi xóa file!"});
        }
        await prisma.proposalAttachments.delete({where: {id: attachmentId}});
        return res.status(200).json({message: "Xóa thành công!", attachmentId, deleted: true});

    } catch (error) {
        if(error.http_code) {
            console.error(`[Delete] Cloudinary lỗi | attachmentId: ${req.params.attachmentId}`, error.message);
            return res.status(502).json({message: "Lỗi kết nối cloud!"});
        }
        console.log(error);
        return res.status(500).json({message:" Có lỗi server!"});
    }
}

export const getAttachments = async (req,res) =>  {
    try {
        if(!req.user) return res.status(401).json({message: "Không xác thực được user"});
        const userId = req.user.userId;
        if(!userId) return res.status(401).json({message: "Không lấy được userId"});
        const result = proposalIdValidator.safeParse(req.params);
        const paginationAtt = pagination.safeParse(req.query);
        if(!paginationAtt.success) return res.status(400).json({error: z.flattenError(paginationAtt.error)});
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {proposalId} = result.data;
        const proposal = await prisma.proposals.findUnique({where: {id: proposalId}, include: {jobs: {select: {clientId: true}}}});
        if(!proposal) return res.status(404).json({message: "Không tìm thấy Proposal!"});
        if(proposal.devId !== userId && proposal.jobs.clientId !== userId) return res.status(403).json({message: "User không có quyền xem attachments!"});
        const {page,limit,sortOrder} = paginationAtt.data;
        const skip = (page-1)*limit;
        const orderBy = {createdAt : sortOrder};
        const [items, totalItems] = await Promise.all([
            prisma.proposalAttachments.findMany({where: {proposalId: proposalId}, skip, take: limit, orderBy}),
            prisma.proposalAttachments.count({where: {proposalId: proposalId}})
        ])
        const totalPages = Math.ceil(totalItems/limit);
        return res.status(200).json({items, pagination: {page,limit,totalItems,totalPages}});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server"});
    }
}
