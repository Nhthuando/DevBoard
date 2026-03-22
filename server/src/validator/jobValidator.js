import {z} from "zod";

export const jobSchema = z.object({
    title: z.string().trim().
        min(1, "Title không được trống!")
        .min(10,"Tối thiểu 10 ký tự!")
        .max(120,"Title không được dài quá 120 kí tự!"),
    description: z.string().trim()
        .min(1, "Description không được trống!")
        .min(30,"Tối thiểu 30 ký tự!")
        .max(5000,"Description không được dài quá 5000 kí tự!"),
    budgetMin: z.coerce.number()
        .min(1,"Budget phải > 0")
        .max(1000000,"Budget vượt quá ngưỡng 1000000"),
    budgetMax: z.coerce.number()
        .min(1,"Budget phải > 0")
        .max(1000000,"Budget vượt quá ngưỡng 1000000"),
    skillsRequired: z.array(z.string().trim().min(1, "Skill không được rỗng!"))
        .min(1,"Phải có ít nhất 1 skill")
        .max(15,"Tối đa được phép 15 skills!")
        .refine((skills) => new Set(skills).size === skills.length,"Không được có skill trùng lặp!"),
    deadline:  z.coerce.date()
        .refine(
        (date) => date > new Date(),
        "Deadline phải lớn hơn thời điểm hiện tại!"
        )
        .refine(
        (date) => date >= new Date(Date.now() + 24 * 60 * 60 * 1000),
        "Deadline phải cách hiện tại ít nhất 24 giờ!"
        )
        .refine(
        (date) => date <= new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        "Deadline không được quá 1 năm!"
        ),
}).refine((data) => data.budgetMax >= data.budgetMin,{
    message: "budgetMax phải lớn hơn hoặc bằng budgetMin!",
    path: ["budgetMax"], 
}
);


export const getJobSchema = z.object({
    page: z.coerce.number().min(1, "Page phải lớn hơn hoặc bằng 1").default(1),
    limit: z.coerce.number().min(1,"Limit tối thiểu 1").max(50,"Limit max là 50").default(10),
    search: z.string().optional(),
    budgetMin: z.coerce.number().optional(),
    budgetMax: z.coerce.number().optional(),
    skills: z.string().optional(),
    sortBy: z.enum(['createdAt', 'budgetMin', 'deadline']).default('createdAt'),
    sortOrder: z.enum(['asc','desc']).default('asc')
}).refine((data) => {
    if(data.budgetMin !== undefined && data.budgetMax !== undefined){
        return data.budgetMax >= data.budgetMin;
    }
    return true;
},{
    message: "budgetMax phải lớn hơn hoặc bằng budgetMin!",
    path: ["budgetMax"], 
})

export const getJobDetailSchema = z.object({
    jobId: z.uuid("JobId phải là UUID hợp lệ!")
})

export const applyJobSchemaParams = z.object({
    jobId: z.uuid("JobId phải là UUID hợp lệ!"),
})
export const applyJobSchemaBody = z.object({
    coverLetter: z.string().trim().min(50, "Cover letter phải tối thiểu 50 kí tự!"),
    bidAmount: z.coerce.number("Bid amount phải là số!").min(1,"Bid amount không được <=0 !").max(10000000,"Bid amount không được vượt quá 10000000")

})
export const getProposalsSchema = z.object({
    jobId: z.uuid("JobId phải là UUID hợp lệ!")
})
