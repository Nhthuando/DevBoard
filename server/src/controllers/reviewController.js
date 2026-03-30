import prisma from "../lib/prisma.js";
import { reviewBody,devIdValidator } from "../validator/reviewValidator.js";
import { contractIdValidator} from "../validator/contractValidator.js";
import {z} from "zod";
import { createNotification } from "../services/notificationService.js";
import { pagination } from "../validator/proposalValidator.js";


export const createReview = async(req,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không thể xác thực user!"});
        const userId = req.user.userId;
        if(!userId) return res.status(401).json({message: "Không thể lấy userId!"});
        const result = reviewBody.safeParse(req.body);
        const result1 = contractIdValidator.safeParse(req.params);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        if(!result1.success) return res.status(400).json({error: z.flattenError(result1.error)});
        const {contractId} = result1.data;
        const {rating, comment} = result.data; 
        const contract = await prisma.contracts.findUnique({where: {id: contractId}});
        if(!contract) return res.status(404).json({message: "Không tìm thấy contract!"});
        if(contract.clientId !== userId) return res.status(403).json({message: "Contract không thuộc về user!"});
        if(contract.status !== "COMPLETED" ) return res.status(409).json({message: "Contract chưa completed!"});
        const existReview = await prisma.reviews.findFirst({where: {contractId: contractId}});
        if(existReview) return res.status(409).json({message: "Đã tạo review trước đó!"});
        const review = await prisma.reviews.create({data: {contractId: contractId,clientId: userId,devId: contract.devId, rating: rating,comment: comment}, select: {id: true,contractId: true,devId: true,rating:true,comment: true,createdAt:true}});
        const notificationBody = comment?.trim()? comment: "Bạn vừa nhận được một đánh giá mới.";
        try {
            await createNotification(contract.devId,"REVIEW_RECEIVED","Bạn có đánh giá review mới!",notificationBody,review.id,"review");
        } catch (notiError) {
            console.error(`[Notification] Tạo notification thất bại | reviewId: ${review.id} `, notiError.message);
        }
        return res.status(201).json({id: review.id, contractId: review.contractId,devId: review.devId, rating: review.rating, comment: review.comment, createdAt: review.createdAt});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}

export const getDevReviews = async (req,res) => {
    try {
        const result = devIdValidator.safeParse(req.params);
        const pagi = pagination.safeParse(req.query);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        if(!pagi.success) return res.status(400).json({error: z.flattenError(pagi.error)});
        const {devId} = result.data;
        const {page,limit,sortOrder} = pagi.data;
        const skip = (page-1)*limit;
        const orderBy = {createdAt: sortOrder};
        const [items,totalItems, aggregate] = await Promise.all([
            prisma.reviews.findMany({where: {devId: devId}, skip,orderBy,take: limit}),
            prisma.reviews.count({where: {devId: devId}}),
            prisma.reviews.aggregate({where: {devId},_avg: { rating: true }})
        ])
        const totalPages = Math.ceil(totalItems/limit);
        const avgRating =  aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : 0;
        return res.status(200).json({items, pagination: {page,limit,totalItems,totalPages}, summary: {totalReviews: totalItems, avgRating}});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}
