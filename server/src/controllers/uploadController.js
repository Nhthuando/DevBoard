import prisma from "../lib/prisma.js";
import { proposalIdValidator } from "../validator/proposalValidator.js";
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