import { z} from "zod";
import {contractIdValidator} from "../validator/contractValidator.js";
import prisma from "../lib/prisma.js";
import { paymentIdValidator } from "../validator/paymentValidator.js";
import stripe from "../services/stripeService.js";
import { transferToDev } from "../services/payoutService.js";

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
        const payment = await prisma.payments.findUnique({where: {id: paymentId}, include: {contracts: {select: {clientId: true, status: true, devId: true}}}});
        if(!payment) return res.status(404).json({message: "Không tìm thấy payment!"});
        if(payment.contracts.clientId !== clientId) return res.status(403).json({message: "Contract không thuộc về user!"});
        if(payment.status !== "ESCROWED") return res.status(409).json({message: "Status payment không phải là ESCROWED!"});
        if(payment.contracts.status !== "ACTIVE") return res.status(409).json({message: "Status của Contract phải là ACTIVE!"});
        const [user,dispute] = await Promise.all([
            prisma.users.findUnique({where: {id: payment.contracts.devId}}),
            prisma.disputes.findFirst({where: {paymentId: payment.id, status: "OPEN"}})
        ])
        if(!user) return res.status(404).json({message: "Không tìm thấy thông tin dev!"});
        if(dispute) return res.status(409).json({message: "Đang có dispute, không thể transfer! "});
        if(payment.stripeTransferId) return res.status(409).json({message: "Đã tất toán cho dev trước rồi!"});
        if(!user.stripeAccountId) return res.status(409).json({message: "Không tìm thấy thông tin tài khoản stripe của DEV!"});
        if(!payment.reviewedAt) return res.status(409).json({message: "Payment chưa được review!"})
        const stripeTransferId = await transferToDev(user.stripeAccountId, payment.amount, payment.id);
        console.log(`[Payout] Payment ${payment.id} | Transfer ${stripeTransferId} | Contract ${payment.contractId}`);
        try {
            await prisma.$transaction([
                prisma.payments.update({where: {id: paymentId}, data: {status: "RELEASED", releasedAt: new Date(), stripeTransferId: stripeTransferId, releaseType: "MANUAL"}}),
                prisma.contracts.update({where: {id: payment.contractId}, data: {status: "COMPLETED"}})
            ]);
        } catch(dbError) {
            console.error(`[CRITICAL] cần xử lý thủ công:
                - paymentId: ${payment.id}
                - stripeTransferId: ${stripeTransferId}
                - contractId: ${payment.contractId}
                - lỗi: ${dbError.message}
            `);
            return res.status(500).json({message: "Có lỗi server! Vui lòng liên hệ hỗ trợ."});
        }
        const updtPayment = await prisma.payments.findFirst({where: {id: paymentId}, select: {id: true, status: true, releasedAt: true, contracts: {select: {id: true, status: true}}}});
        return res.status(200).json({updtPayment});
    } catch (error) {
        if(error.type?.startsWith("Stripe")) {
            console.error(`[Payout] Stripe lỗi `, error.message);
            return res.status(502).json({message: "Lỗi cổng thanh toán!"});
        }
        console.error(`[Payout] DB fail sau khi Stripe transfer | CẦN XỬ LÝ THỦ CÔNG`, error);
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
        if(payment.status === "ESCROWED") return res.status(409).json({message: "Thanh toán đã hoàn tất!"});
        if(payment.status === "RELEASED") return res.status(409).json({message: "Payment đã được release!"});
        if(payment.status === "DISPUTED") return res.status(409).json({message: "Payment đang có dispute!"});        const contractId = payment.contractId;
        if(payment.status === "REFUNDED") return res.status(409).json({ message: "Payment đã được hoàn tiền, không thể thanh toán lại!" });
        if(payment.lastCheckoutAt) {
            const diff = Date.now() - new Date(payment.lastCheckoutAt).getTime();
            const cooldown = 30 * 1000; // 30 giây
            if(diff < cooldown) return res.status(429).json({ message: "Vui lòng chờ 30 giây trước khi thử lại!" });
        }
        const {id,url, payment_intent} = await stripe.checkout.sessions.create({
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
        await prisma.payments.update({where: {id: paymentId}, data: {stripeSessionId: id, lastCheckoutAt: new Date( ), stripePaymentIntentId: payment_intent ?? null}});
        return res.status(200).json({sessionId : id, checkoutUrl: url, message: "Vui lòng thanh toán để tiếp tục"});
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
            const failureCode = event.data.object.last_payment_error?.code;
            const failureMessage = event.data.object.last_payment_error?.message;
            let payment = await prisma.payments.findFirst({
                where: { stripePaymentIntentId: paymentIntentId }
            });
            if(!payment) {
                const sessions = await stripe.checkout.sessions.list({
                    payment_intent: paymentIntentId,
                    limit: 1
                });
                const sessionId = sessions.data[0]?.id;
                if(sessionId) {
                    payment = await prisma.payments.findFirst({
                        where: { stripeSessionId: sessionId }
                    });
                }
            }
            if(!payment) {
                console.log(`[Webhook] payment_intent.payment_failed | eventId: ${event.id} | intentId: ${paymentIntentId} | Không tìm thấy payment`);
                return res.status(200).json({ received: true });
            }
            console.log(`[Webhook] payment_intent.payment_failed | eventId: ${event.id} | paymentId: ${payment.id} | intentId: ${paymentIntentId} | code: ${failureCode} | message: ${failureMessage}`);
            return res.status(200).json({ received: true });
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

