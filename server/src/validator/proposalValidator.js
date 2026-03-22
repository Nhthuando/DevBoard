import {z} from "zod";

export const proposalIdValidator = z.object({
    proposalId : z.uuid("ProposalId phải là UUID hợp lệ!")
})

export const updateProposalStatusSchema = z.object({
    status: z.enum(["ACCEPTED", "REJECTED"],)
})
