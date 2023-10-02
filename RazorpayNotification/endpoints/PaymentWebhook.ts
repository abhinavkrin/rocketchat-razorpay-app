import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ApiEndpoint,
    IApiEndpointInfo,
    IApiRequest,
    IApiResponse,
} from "@rocket.chat/apps-engine/definition/api";
import { getRazorpayPaymentBlocks } from "../lib/getRazorpayPaymentBlocks";
import { RoomSubscriptionPersistence } from "../lib/RoomSubscriptionPersistence";
import { InstallationTokenPersistence } from "../lib/InstallationTokenPersistence";

const PaymentEvent = {
    Authorized: "payment.authorized",
};
export class PaymentWebhook extends ApiEndpoint {
    public path = "payment-webhook";
    public example = [];

    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<IApiResponse> {
        const installationTokenPersistence = new InstallationTokenPersistence(null, read.getPersistenceReader());
        const i_token = await installationTokenPersistence.getToken(); 
        if (request.query.i_token !== i_token) {
            return {
                status: 401,
                content: { message: "unauthorized" },
            };
        }
        switch (request.content.event) {
            case PaymentEvent.Authorized:
                const payload = request.content.payload;
                const payment = payload.payment.entity;

                const roomPersistence = new RoomSubscriptionPersistence(
                    persis,
                    read.getPersistenceReader()
                );
                const subscribedRooms = await roomPersistence.getAllRooms();
                this.app.getLogger().log(subscribedRooms);
                const sendNotification = async (subscribedRoom) => {
                    try {
                        const room = await read.getRoomReader().getById(subscribedRoom.room.id);
                        if (room) {
                            const messageBuilder = modify
                                .getCreator()
                                .startMessage()
                                .setRoom(room)
                                .addBlocks(getRazorpayPaymentBlocks(payment));
                            await modify.getCreator().finish(messageBuilder);
                        } else {
                            this.app.getLogger().log(`Room ${subscribedRoom.room.id} not found`);
                        }
                    } catch (e) {
                        // unknown failure
                        this.app.getLogger().log(e);
                    }
                };
                await Promise.all(subscribedRooms.map(sendNotification));
                return { status: 200, content: { message: "ok" } };
            default:
                return {
                    status: 501,
                    content: { message: "event not implemented" },
                };
        }
    }
}
