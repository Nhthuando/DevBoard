import {z} from "zod";

export const notificationIdValidator = z.object({
    notificationId : z.uuid("Notification Id phải là UUID hợp lệ!")
})