import prisma from "../lib/prisma.js";

export const createNotification = async(userId,type,title,body,referenceId,referenceType) => {
    try {
        const notification = await prisma.notifications.create({data: {userId, type,title,body,referenceId,referenceType}});
        return notification;
    } catch (error) {
        console.error(`[Notification] Lỗi | userId: ${userId} | type: ${type}`, error.message);
    }
}