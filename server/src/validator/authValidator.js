import { z} from "zod";

export const registerSchema = z.object({
    name: z.string().min(1, "Tên không được trống!"),
    email: z.email("Email không hợp lệ!"),
    password: z.string().min(8, "Password phải đủ từ 8 ký tự trở lên!").regex(/[A-Z]/, "Thiếu kí tự viết hoa!").regex(/[a-z]/, "thiếu kí tự viết thường!").regex(/[^A-Za-z0-9]/, "Thiếu kí tự đặc biệt!")
})

export const loginSchema = registerSchema.pick({
    email: true,
    password: true
})