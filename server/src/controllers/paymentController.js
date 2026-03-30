import {contractIdValidator} from "../validator/contractValidator.js";
import prisma from "../lib/prisma.js";
import { paymentIdValidator, pagination } from "../validator/paymentValidator.js";
import stripe from "../services/stripeService.js";
import { transferToDev } from "../services/payoutService.js";
import {z} from "zod";
import { createNotification } from "../services/notificationService.js";

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
                prisma.contracts.update({where: {id: payment.contractId}, data: {status: "COMPLETED"}}),
                prisma.paymentLogs.create({data: {createdAt: new Date() ,fromStatus: "ESCROWED", toStatus: "RELEASED",action: "RELEASE_MANUAL", actorType:"CLIENT",stripeRef:stripeTransferId,note: "Release thủ công sau khi review!", paymentId: paymentId}})
            ]);
        } catch(dbError) {
            console.error(`[CRITICAL] cần xử lý thủ công:
                - paymentId: ${payment.id}
                - stripeTransferId: ${stripeTransferId}
                - contractId: ${payment.contractId}
                - lỗi: ${dbError.message}
            `);
            await prisma.paymentLogs.create({data: {createdAt: new Date() ,action : "RECONCILE_REQUIRED", paymentId: paymentId, stripeRef: stripeTransferId, note: `DbError: ${dbError}`, actorType: "SYSTEM"}});
            return res.status(500).json({message: "Có lỗi server! Vui lòng liên hệ hỗ trợ."});
        }
        const updtPayment = await prisma.payments.findFirst({where: {id: paymentId}, select: {id: true, status: true, releasedAt: true, contracts: {select: {id: true, status: true}}}});
        try {
            await createNotification(payment.contracts.devId,"PAYMENT_RELEASED","Tiền đã được chuyển","Tiền đã được chuyển vào tài khoản của bạn",payment.id,"payment")
        } catch (notiError) {
            console.error(`[Notification] Tạo notification thất bại | paymentId: ${payment.id} | event: PAYMENT_RELEASED`, notiError.message);
        }
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
        await Promise.all([
            prisma.payments.update({where: {id: paymentId}, data: {stripeSessionId: id, lastCheckoutAt: new Date( ), stripePaymentIntentId: payment_intent ?? null}}),
            prisma.paymentLogs.create({data: {createdAt: new Date() ,actorType:"CLIENT", paymentId: paymentId, action:"CHECKOUT_INITIATED", fromStatus: "PENDING", toStatus: "PENDING", stripeRef: id, note: "Tạo checkout requested thủ công!"}})
        
        ])
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
            const contract = await prisma.contracts.findUnique({where: {id: session.metadata.contractId}, select: {devId: true, clientId: true}})
            if(!contract) {
                console.log("Không tìm thấy constract!");
                return res.status(200).json({received: true });
            }
            await prisma.paymentLogs.create({data: {createdAt: new Date() ,fromStatus: "PENDING", paymentId: session.metadata.paymentId, toStatus: "ESCROWED",actorType: "WEBHOOK", action: "CHECKOUT_COMPLETED", stripeRef: session.payment_intent}});
            try {
            await Promise.all([
                createNotification(contract.clientId, "PAYMENT_ESCROWED", "Thanh toán thành công", "Tiền đã được giữ trong escrow", session.metadata.paymentId, "payment"),
                createNotification(contract.devId, "PAYMENT_ESCROWED", "Client đã thanh toán", "Client đã đặt cọc, hãy bắt đầu công việc", session.metadata.paymentId, "payment")
            ]);
            } catch(notiError) {
                console.error(`[Notification] Tạo notification thất bại | paymentId: ${session.metadata.paymentId} | event: PAYMENT_ESCROWED`, notiError.message);
            }
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
            await prisma.paymentLogs.create({data: {createdAt: new Date() ,actorType: "WEBHOOK", paymentId: payment.id,action: "PAYMENT_FAILED", fromStatus:"PENDING", toStatus:"PENDING",stripeRef: paymentIntentId, note: `eventId: ${event.id} | paymentId: ${payment.id} | intentId: ${paymentIntentId} | code: ${failureCode} | message: ${failureMessage}`}})
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
            await prisma.paymentLogs.create({data: {createdAt: new Date() ,fromStatus: "ESCROWED", paymentId: payment.id,toStatus: "REFUNDED",actorType: "WEBHOOK", action: "REFUND_WEBHOOK", stripeRef: paymentIntentId, note: `eventId = ${event.data.object.id}`}})
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
            await prisma.paymentLogs.create({data: {createdAt: new Date() ,fromStatus: "ESCROWED", paymentId: payment.id,toStatus: "DISPUTED",actorType:"WEBHOOK",action:"DISPUTE_WEBHOOK", stripeRef: paymentIntentId,note: `reason = ${event.data.object.reason ?? "Không có reason từ stripe!"}`}});
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


export const getPaymentLog = async (req,res) => {
    try {
        if(!req.user) return res.status(401).json({message: "Không thể xác thực user!"});
        const {userId} = req.user;
        if(!userId ) return res.status(401).json({message: "Không lấy được  user id!"});
        const result = paymentIdValidator.safeParse(req.params);
        const paginationLog = pagination.safeParse(req.query);
        if(!paginationLog.success) return res.status(400).json({error: z.flattenError(paginationLog.error)});
        if(!result.success) return res.status(400).json({error: z.flattenError(result.error)});
        const {paymentId} = result.data;
        const payment = await prisma.payments.findFirst({where: {id: paymentId}, include: {contracts: {select: {clientId: true, devId: true}}}});
        if(!payment ) return res.status(404).json({message: "Không tìm thấy payment!"});
        if(payment.contracts.devId !== userId && payment.contracts.clientId !== userId) return res.status(403).json({message: "Payment không thuộc về user!"});
        const {page,limit,sortOrder} = paginationLog.data; 
        const skip = (page-1)*limit;
        const orderBy = { createdAt : sortOrder }; 
        const [items, totalItems] = await Promise.all([
            prisma.paymentLogs.findMany({where: {paymentId: paymentId}, skip,take: limit , orderBy}),
            prisma.paymentLogs.count({where: {paymentId: paymentId}})
        ])
        const totalPages = Math.ceil(totalItems/limit);
        if(items.length === 0) return res.status(404).json({message: "Không tồn tại logs nào!"});
        return res.status(200).json({items, totalItems, totalPages});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Có lỗi server !"});
    }
}