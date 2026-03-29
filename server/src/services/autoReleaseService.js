import prisma from "../lib/prisma.js";


export const processOneAutoRelease = async (payment, now) => {
    await prisma.$transaction(async (tx) => {
        const [updatedPayment, log] = await Promise([
            tx.payments.updateMany({where: {id: payment.id,status: "ESCROWED"  },data: {status: "RELEASED",releaseType: "AUTO",releasedAt: now,reviewedAt: now}}),
            tx.paymentLogs.create({data: {fromStatus: "ESCROWED", toStatus: "RELEASED",action:"RELEASE_AUTO", actorType:"SCHEDULER",note:"Đến hạn deadline!",createdAt: new Date() }})
        ])

        if(updatedPayment.count === 0) {
            console.log(`[AutoRelease] Không có Payment nào đủ điều kiện xử lý`);
            return; 
        }
        await tx.contracts.update({
            where: { id: payment.contractId },
            data: { status: "COMPLETED" }
        });
    });
}

export const runAutoReleaseJob = async () => {
    const now = new Date();
    const batchSize = Number(process.env.AUTO_RELEASE_BATCH_SIZE) || 50;
    const payments = await prisma.payments.findMany({
        where: {
            status: "ESCROWED",
            deliveredAt: { not: null },
            reviewedAt: null,
            reviewDeadline: { lte: now }  
        },
        take: batchSize
    });
    console.log(`[AutoRelease] Tìm thấy ${payments.length} payment cần xử lý`);
    let success = 0;
    let failed = 0;
    for (const payment of payments) {
        try {
            await processOneAutoRelease(payment, now);
            success++;
        } catch (error) {
            failed++;
            console.error(`[AutoRelease] Lỗi payment ${payment.id}:`, error.message);
        }
    }
    console.log(`[AutoRelease] có: ${success} thành công, ${failed} thất bại`);
}