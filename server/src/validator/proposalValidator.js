import {z} from "zod";

export const proposalIdValidator = z.object({
    proposalId : z.uuid("ProposalId phải là UUID hợp lệ!")
})

export const updateProposalStatusSchema = z.object({
    status: z.enum(["ACCEPTED", "REJECTED"],)
})

export const getDevProposalsSchema = z.object({
    status: z.enum(["PENDING","ACCEPTED","REJECTED","WITHDRAWN"]).optional(),
    page: z.coerce.number().min(1, "Page phải lớn hơn hoặc bằng 1").default(1),
    limit: z.coerce.number().min(1,"Limit tối thiểu 1").max(50,"Limit max là 50").default(10),
    sortOrder: z.enum(["asc","desc"]).default("desc")
})



