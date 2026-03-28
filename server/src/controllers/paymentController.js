import { z} from "zod";
import {contractIdValidator} from "../validator/contractValidator.js";
import prisma from "../lib/prisma.js";
import { paymentIdValidator } from "../validator/paymentValidator.js";
import stripe from "../services/stripeService.js";

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


export const releasePayment = async (req,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không thể xác thực user!"});
        const clientId = req.user.userId;
        if(!clientId) return res.status(401).json({message: "Không thể lấy user Id!"});
        const result = paymentIdValidator.safeParse(req.params);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {paymentId} = result.data;
        const payment = await prisma.payments.findUnique({where: {id: paymentId}, include: {contracts: {select: {clientId: true, status: true}}}});
        if(!payment) return res.status(404).json({message: "Không tìm thấy payment!"});
        if(payment.contracts.clientId !== clientId) return res.status(403).json({message: "Contract không thuộc về user!"});
        if(payment.status !== "ESCROWED") return res.status(409).json({message: "Status payment không phải là ESCROWED!"});
        if(payment.contracts.status !== "ACTIVE") return res.status(409).json({message: "Status của Contract phải là ACTIVE!"});
        await prisma.$transaction([
            prisma.payments.update({where: {id: paymentId}, data :{status: "RELEASED", releasedAt: new Date()}}),
            prisma.contracts.update({where: {id: payment.contractId}, data: {status: "COMPLETED"}})
        ]);
        const updtPayment = await prisma.payments.findFirst({where: {id: paymentId}, select: {id: true, status: true, releasedAt: true, contracts: {select: {id: true, status: true}}}});
        return res.status(200).json({updtPayment});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}

export const checkoutStripe = async(req,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không thể xác thực user!"});
        const clientId = req.user.userId;
        if(!clientId) return res.status(401).json({message: "Không thể lấy user Id!"});
        const result = paymentIdValidator.safeParse(req.params);
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {paymentId} = result.data;
        const payment = await prisma.payments.findUnique({where: {id: paymentId}, include: {contracts: {select: {clientId: true, jobs: {select : {title: true}}}}}});
        if(!payment) return res.status(404).json({message: "Payment không tồn tại!"});
        if(payment.contracts.clientId !== clientId) return res.status(403).json({message: "Payment không thuộc về client!"});
        if(payment.status !== "PENDING") return res.status(409).json({message: "Status phải là pending!"});
        const contractId = payment.contractId;
        const {id,url} = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "usd",
                    unit_amount: Math.round(Number(payment.amount) * 100),
                    product_data: {
                        name: `Contract: ${payment.contractId} | Job: ${payment.contracts.jobs.title}`,
                    }
                },
                quantity: 1
            }
            ],
            mode: "payment",
            metadata: { paymentId, contractId, clientId },
            success_url: `${process.env.CLIENT_URL}/payment/success`,
            cancel_url: `${process.env.CLIENT_URL}/payment/cancel`
        })
        await prisma.payments.update({where: {id: paymentId}, data: {stripeSessionId: id}});
        return res.status(200).json({sessionId : id, checkoutUrl: url});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server!"});
    }
}

export const handleStripeWebhook = async(req,res) => {
    try {
        const event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
    )
    switch(event.type){
        case "checkout.session.completed":{
            const session = event.data.object;
            if(!session.metadata) return res.status(400).json({message: "Metadata không có thông tin!"});
            if(!session.metadata.paymentId) return res.status(400).json({message: "Không lấy được paymentId từ metadata!"});
            const updated = await prisma.payments.updateMany({where: {id: session.metadata.paymentId,status: "PENDING"  },data: {stripePaymentIntentId: session.payment_intent,status: "ESCROWED",paidAt: new Date()}});
            if(updated.count === 0 ) return res.status(200).json({message: "Không tìm thấy payment hoặc đã xử lý rồi!"});
            return res.status(200).json({received: true});
        }
        case "payment_intent.payment_failed" : {
            const paymentIntentId = event.data.object.id;
            const payment = await prisma.payments.findUnique({where: {stripePaymentIntentId: paymentIntentId}});
            if(!payment) {
                console.log({message: " Không tìm thấy Payment!"});
                return res.status(200).json({received: true});
            }
            console.log(`${payment.id} bị Failed`);
            return res.status(200).json({received: true});
        }
        case "charge.refunded" : {
            const paymentIntentId = event.data.object.payment_intent;
            const payment = await prisma.payments.findUnique({where : {stripePaymentIntentId: paymentIntentId}});
            if(!payment) {
                console.log(`[Webhook] Không tìm thấy payment với intentId: ${paymentIntentId}`);
                return res.status(200).json({received: true});
            }
            if(payment.status !== "ESCROWED"){
                console.log("Status đang không phải ESCROWED!");
                return res.status(200).json({received: true});
            }
            const upd = await prisma.payments.updateMany({where: {stripePaymentIntentId: paymentIntentId}, data: {status : "REFUNDED"}});
            if(upd.count === 0 ) return res.status(200).json({message: "Không tìm thấy payment hoặc đã xử lý rồi!"});
            return res.status(200).json({received: true});
        }   
        case "charge.dispute.created" : {
            const paymentIntentId = event.data.object.payment_intent;
            const payment = await prisma.payments.findUnique({where: {stripePaymentIntentId: paymentIntentId}});
            if(!payment) {
                console.log(`[Webhook] Không tìm thấy payment với intentId: ${paymentIntentId}`);
                return res.status(200).json({received: true});
            }
            if(payment.status !== "ESCROWED") {
                console.log("Status đang không phải ESCROWED!");
                return res.status(200).json({received: true});
            }
            const contract = await prisma.contracts.findUnique({where: {id : payment.contractId}});
            if(!contract){
                console.log(`[Webhook] Không tìm thấy contract của payment: ${payment.id}`);
                return res.status(200).json({received: true});
            }
            const existDispute = await prisma.disputes.findFirst({where: { paymentId: payment.id }});
            if(existDispute) {
                console.log(`[Webhook] Dispute cho payment ${payment.id} đã tồn tại, bỏ qua`);
                return res.status(200).json({ received: true });
            }
            await prisma.$transaction([   
            prisma.disputes.create({data: {paymentId: payment.id, openedBy: contract.clientId , reason: event.data.object.reason ?? "Không có lý do từ Stripe",status: "OPEN",createdAt: new Date()}}),
            prisma.payments.update({where: {id: payment.id}, data: {status: "DISPUTED",reviewedAt: new Date()}}),
            prisma.contracts.update({where: {id: contract.id}, data: {status: "DISPUTED"}})
            ])
            console.log("Đã tạo dispute!");
            return res.status(200).json({received: true });
        }
        default: {
            return res.status(200).json({received: true});
        }
    }
    } catch (error) {
    if (error.type === "StripeSignatureVerificationError") {
        return res.status(400).json({ message: "Signature không hợp lệ!" })
    }
    return res.status(500).json({ message: "Có lỗi server!" })
    }
} 

