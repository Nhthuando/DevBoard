import prisma from "../lib/prisma.js";
import {z} from "zod";

const jobSchema = z.object({
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
    message: "budgetMax phải lớn hơn budgetMin!",
    path: ["budgetMax"], 
}
);


export const createJob = async (req,res) =>{
    try {
        if (!req.user) return res.status(401).json({ message: "Chưa xác thực!" });
        const result = jobSchema.safeParse(req.body);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const ownerId = req.user.userId;
        if(!ownerId) return res.status(401).json({message: "Không lấy được OwnerId!"});
        const {skillsRequired,...rest} = result.data;
        const skillRecords = await Promise.all(skillsRequired.map((name) => {
            const nomarlize = name.toUpperCase().trim();
            return prisma.skills.upsert({where: {name: nomarlize}, update: {}, create: {name: nomarlize}});
        }
    )
    );
        const job = await prisma.jobs.create({data: {...rest,jobSkills: {create: skillRecords.map((skill) => ({skillId: skill.id}))} ,clientId: ownerId, status: "OPEN"}});
        return res.status(201).json({job});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Có lỗi server!"});
    }
}