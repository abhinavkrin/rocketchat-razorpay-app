import {
    IPersistence,
    IPersistenceRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { generateToken } from "./generateToken";

export class InstallationTokenPersistence {
    persistenceRead: IPersistenceRead | null;
    persistence: IPersistence | null;
    constructor(persistence: IPersistence | null, persistenceRead: IPersistenceRead | null) {
        this.persistenceRead = persistenceRead;
        this.persistence = persistence;
    }
    async createToken() {
				if (!this.persistence) {
					throw new Error('persistence was not provided to the constructor');
				}
        const associations = [
            new RocketChatAssociationRecord(
                RocketChatAssociationModel.MISC,
                "installation-token"
            ),
        ];
				const token = generateToken();
        await this.persistence.createWithAssociations(
            { token },
            associations
        );
    }
    async getToken() {
				if (!this.persistenceRead) {
					throw new Error('persistenceReader was not provided to the constructor');
				}
        const associations = [
            new RocketChatAssociationRecord(
                RocketChatAssociationModel.MISC,
                "installation-token"
            )
        ];
        const [record] = await this.persistenceRead.readByAssociations(associations);
				return (record as any)?.token || null;
    }
}
