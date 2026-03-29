import {z} from "zod";

export const paymentIdValidator = z.object({
    paymentId : z.uuid("Payment ID phải là UUID hợp lệ!")
})

export const pagination = z.object({
    page: z.coerce.number().min(1, "Page phải lớn hơn hoặc bằng 1").default(1),
    limit: z.coerce.number().min(1,"Limit tối thiểu 1").max(50,"Limit max là 50").default(10),
    sortOrder: z.enum(["asc","desc"]).default("desc")
})