import { currencySymbolMapping } from "./currencySymbolMapping";

export const getRazorpayPaymentBlocks = (payment: any) => {
    const curreny = currencySymbolMapping[payment.currency] //getSymbolFromCurrency(payment.currency);
    const amount = (payment.amount / 100).toFixed(2);
    const blocks = [
        {
            type: "section",
            text: { type: "mrkdwn", text: "### [Razorpay] Payment Successful ✅" },
        },
        { type: "section", text: { type: "mrkdwn", text: `## ${curreny} ${amount}` } },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Payment Id:*\n${payment.id}\n*Customer Details*:\n${payment.email}\n${payment.contact}`,
            },
        },
        {
            type: "actions",
            elements: [
                {
                    type: "button",
                    appId: "app-id",
                    blockId: "block-id",
                    actionId: "action-id",
                    text: {
                        type: "plain_text",
                        text: "Open in Razorpay",
                        emoji: true,
                    },
                    url: `https://dashboard.razorpay.com/app/payments/${payment.id}`,
                },
            ],
        },
    ] as any;
    return blocks;
};
