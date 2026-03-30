import {z} from "zod";

export const reviewBody = z.object({
    rating: z.number().int().min(1, "Rating tối thiểu là 1!").max(5, "Rating tối đa là 5!"),
    comment: z.string().trim().max(1000, "Comment tối đa 1000 kí tự!").optional()
})

export const devIdValidator = z.object({
    devId: z.uuid("Dev ID phải là UUID hợp lệ!")
}) 