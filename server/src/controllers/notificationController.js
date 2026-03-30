import { z} from "zod";
import { pagination } from "../validator/proposalValidator.js";
import { notificationIdValidator } from "../validator/notificationValidator.js";
import prisma from "../lib/prisma.js";

export const getNotification = async (req,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không xác thực được user!"});
        const userId = req.user.userId;
        if(!userId)  return res.status(401).json({message: "Không lấy được userId"});
        const paginationNoti = pagination.safeParse(req.query);
        if(!paginationNoti.success) return res.status(400).json({error: z.flattenError(paginationNoti.error)});
        const {page, limit, sortOrder} = paginationNoti.data;
        const skip = (page-1)*limit;
        const orderBy = {createdAt: sortOrder};
        const [items, totalItems] = await Promise.all([
            prisma.notifications.findMany({where: {userId: userId}, skip, take: limit, orderBy}),
            prisma.notifications.count({where: {userId: userId}})
        ])  
        const totalPages = Math.ceil(totalItems/limit);
        return res.status(200).json({items, pagination: {page,limit,totalItems,totalPages}});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}

export const markAsRead = async(req,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không xác thực được user!"});
        const userId = req.user.userId;
        if(!userId)  return res.status(401).json({message: "Không lấy được userId"});
        const result = notificationIdValidator.safeParse(req.params);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {notificationId} = result.data;
        const notification = await prisma.notifications.findUnique({where: {id: notificationId}});
        if(!notification) return res.status(404).json({message:"Không tìm thấy notification"});
        if(notification.userId !== userId) return res.status(403).json({message:"User không có quyền xem notification này!"});
        const updNoti = await prisma.notifications.update({where: {id: notificationId}, data:{isRead: true}});
        return res.status(200).json(updNoti);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}