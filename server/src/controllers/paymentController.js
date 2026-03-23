import {z} from "zod";
import {contractIdValidator} from "../validator/contractValidator.js";
import prisma from "../lib/prisma.js";
import { paymentIdValidator } from "../validator/paymentValidator.js";

export const createPayment = async (req ,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không thể xác thực user!"});
        const clientId = req.user.userId;
        if(!clientId) return res.status(401).json({message: "Không thể lấy user id!"});
        const result = contractIdValidator.safeParse(req.params);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {contractId} = result.data;
        const contract = await prisma.contracts.findUnique({where: {id: contractId}});
        if(!contract) return res.status(404).json({message: "Không tìm thấy contract!"});
        if(contract.clientId !== clientId) return res.status(403).json({message: "Hợp đồng không thuộc về user!"});
        if(contract.status !== "ACTIVE") return res.status(409).json({message: "Contract status không còn ACTIVE!"});
        const existPayment = await prisma.payments.findUnique({where: {contractId: contractId}});
        if(existPayment) return res.status(409).json({message: "Contract đã tồn tại payment!"});
        const payment = await prisma.payments.create({data: {contractId: contractId, amount : contract.agreedAmount, status: "PENDING"}, select: {id: true, contractId: true, amount: true, status :true, createdAt: true}});
        return res.status(201).json({payment});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Có lỗi server!"});
    }
}

export const changePaymentStatus = async (req,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không thể xác thực user!"});
        const clientId = req.user.userId;
        if(!clientId) return res.status(401).json({message: "Không thể lấy user Id!"});
        const result = paymentIdValidator.safeParse(req.params);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {paymentId} = result.data;
        const payment = await prisma.payments.findUnique({where :{ id :paymentId}, include: {contracts: {select :{clientId: true}}}});
        if(!payment) return res.status(404).json({message: "Không tìm thấy payment!"});
        if(payment.contracts.clientId !== clientId) return res.status(403).json({message: "Payment không thuộc về user!"});
        if(payment.status !== "PENDING") return res.status(409).json({message: "Status không phải là PENDING!"});
        const updtPayment = await prisma.payments.update({where : {id :paymentId }, data : {status : "ESCROWED", paidAt: new Date()}, select: {id: true, contractId: true, status: true, paidAt: true, updatedAt: true}});
        return res.status(200).json({updtPayment});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}