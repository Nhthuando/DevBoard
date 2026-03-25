import {z} from "zod";

export const getContractSchema = z.object({
    status: z.enum(["ACTIVE","COMPLETED","DISPUTED","CANCELLED"]).optional(),
    page: z.coerce.number().min(1, "Page phải lớn hơn hoặc bằng 1").default(1),
    limit: z.coerce.number().min(1,"Limit tối thiểu 1").max(50,"Limit max là 50").default(10),
    sortOrder: z.enum(["asc","desc"]).default("desc")
})
export const contractIdValidator = z.object({
    contractId: z.uuid("Contract id phải là UUID hợp lệ!")
})

export const submitDeliverySchema = z.object({
    deliveryNote: z.string().trim().min(1,"Delivery Note không được rỗng!").max(500, "Tối đa 500 kí tự!"),
    deliveryUrl: z.url("Delivery url phải là URL hợp lệ!").optional()
})

export const reviewDeliverySchema = z.object({
    action: z.enum(["ACCEPT","DISPUTE"]),
    reason: z.string().min(10, "Reason phải có ít nhất 10 ký tự!").optional()
}).refine((data) => {
    if(data.action === "DISPUTE" && !data.reason){
        return false;
    }
    return true;
}, {
    message: "Reason bắt buộc phải có nếu DISPUTE",
    path: ["reason"]
});