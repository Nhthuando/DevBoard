import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {loginSchema, registerSchema} from "../validator/authValidator.js";

export const register = async(req,res) =>{
    try {
        const result = registerSchema.safeParse(req.body);
    if(!result.success) return res.status(400).json({error: z.flattenError(result.error)})
    const {name,email,password} = result.data;
    const existEmail = await prisma.users.findUnique({where: {email} });
    if(existEmail) return res.status(409).json({message: "Tài khoản đã tồn tại!"});
    const hashedPassword = await bcrypt.hash(password,10);
    await prisma.users.create({data: {name,email,password: hashedPassword, role:"DEV"}});
    return res.status(201).json({data: {name, email}});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}   

export const login = async (req,res) => {
    try {
        const result = loginSchema.safeParse(req.body);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {email, password} = result.data;
        const user = await prisma.users.findUnique({where: {email}});
        if(!user) return res.status(401).json({message: "Tài khoản hoặc mật khẩu không chính xác!"});
        const valid = await bcrypt.compare(password,user.password);
        if(!valid) return res.status(401).json({message: "Tài khoản hoặc mật khẩu không chính xác!"});
        const token = jwt.sign({userId: user.id, email: user.email, role: user.role}, process.env.JWT_SECRET, {expiresIn: "1h"});
        return res.status(200).json({token, name: user.name, email: user.email});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}

export const getMe = async (req,res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Chưa xác thực!" });
        const userId = req.user.userId;
        if(!userId) return res.status(401).json({message: "Không lấy được userId!"});
        const user = await prisma.users.findUnique({where: {id: userId}, select: {id:true,name:true, email:true, role:true, createdAt: true}});
        if(!user) return res.status(404).json({message: "Không tìm thấy user!"});
        return res.status(200).json({user});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}