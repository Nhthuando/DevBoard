import stripe from "./stripeService.js"

export const transferToDev = async (stripeAccountId, amount, paymentId) => {
    const transfer = await stripe.transfers.create({
        amount: Math.round(Number(amount)*100),
        currency: "usd",
        destination: stripeAccountId,
    },{
        idempotencyKey: `transfer_${paymentId}`
    })
    return transfer.id;
}