import { IApp } from "@rocket.chat/apps-engine/definition/IApp";
import { InstallationTokenPersistence } from "./InstallationTokenPersistence";
import { IPersistence } from "@rocket.chat/apps-engine/definition/accessors";
import { URL } from "url";

export const getWebhookUrl = async (app: IApp) => {
    const serverURL = await app
        .getAccessors()
        .environmentReader.getServerSettings()
        .getValueById("Site_Url");
    const webhookEndPoint = app
        .getAccessors()
        .providedApiEndpoints.find(
            (endpoint) => endpoint.path === "payment-webhook"
        );
    const persistenceReader = app.getAccessors().reader.getPersistenceReader();
    const installationTokenPersistence = new InstallationTokenPersistence(null, persistenceReader);
    const token = await installationTokenPersistence.getToken();
    if (webhookEndPoint) {
        const webhookURL = new URL(webhookEndPoint.computedPath || "", serverURL)
        webhookURL.searchParams.append('i_token', token);
        return webhookURL.toString();
    }
    return "";
};
