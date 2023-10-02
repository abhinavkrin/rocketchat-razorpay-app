import {
    IPersistence,
    IPersistenceRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";

export class RoomSubscriptionPersistence {
    persistenceRead: IPersistenceRead;
    persistence: IPersistence;
    constructor(persistence: IPersistence, persistenceRead: IPersistenceRead) {
        this.persistenceRead = persistenceRead;
        this.persistence = persistence;
    }
    async addRoom(room: IRoom) {
        const associations = [
            new RocketChatAssociationRecord(
                RocketChatAssociationModel.MISC,
                "razorpay-subscribed-room"
            ),
            new RocketChatAssociationRecord(
                RocketChatAssociationModel.ROOM,
                room.id
            ),
        ];
        await this.persistence.createWithAssociations(
            { room: { id: room.id } },
            associations
        );
    }
    async removeRoom(room: IRoom) {
        const associations = [
            new RocketChatAssociationRecord(
                RocketChatAssociationModel.MISC,
                "razorpay-subscribed-room"
            ),
            new RocketChatAssociationRecord(
                RocketChatAssociationModel.ROOM,
                room.id
            ),
        ];
        await this.persistence.removeByAssociations(associations);
    }
    async getAllRooms() {
        const associations = [
            new RocketChatAssociationRecord(
                RocketChatAssociationModel.MISC,
                "razorpay-subscribed-room"
            )
        ];
        return this.persistenceRead.readByAssociations(associations);
    }
}
