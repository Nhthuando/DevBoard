import {z} from "zod";

export const getContractSchema = z.object({
    status: z.enum(["ACTIVE","COMPLETED","DISPUTED","CANCELLED"]),
    page: z.coerce.number().min(1, "Page phải lớn hơn hoặc bằng 1").default(1),
    limit: z.coerce.number().min(1,"Limit tối thiểu 1").max(50,"Limit max là 50").default(10),
    sortOrder: z.enum(["asc","desc"]).default("desc")
})