import { IApp } from "@rocket.chat/apps-engine/definition/IApp";
import { RoomSubscriptionPersistence } from "./RoomSubscriptionPersistence";
import { getRazorpayPaymentBlocks } from "./getRazorpayPaymentBlocks";
import { IProcessor } from "@rocket.chat/apps-engine/definition/scheduler";

export class NotifyPaymentProcessor implements IProcessor {
    public id = "notify-payment";
    async processor(jobContext, read, modify, http, persis) {
        const payload = jobContext;
        const payment = payload.payment.entity;

        const roomPersistence = new RoomSubscriptionPersistence(
            persis,
            read.getPersistenceReader()
        );
        const subscribedRooms = await roomPersistence.getAllRooms();
        const blocks = getRazorpayPaymentBlocks(payment);
        const sendNotification = async (subscribedRoom) => {
            try {
                const room = await read
                    .getRoomReader()
                    .getById(subscribedRoom.room.id);
                if (room) {
                    const messageBuilder = modify
                        .getCreator()
                        .startMessage()
                        .setRoom(room)
                        .addBlocks(blocks);
                    await modify.getCreator().finish(messageBuilder);
                }
            } catch (e) {
                // unknown failure
            }
        };
        await Promise.all(subscribedRooms.map(sendNotification));
    }
}
