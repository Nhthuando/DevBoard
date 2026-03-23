import {z} from "zod";

export const paymentIdValidator = z.object({
    paymentId : z.uuid("Payment ID phải là UUID hợp lệ!")
})
