import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    ILogger,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { settings } from "./settings/settings";
import { PaymentWebhook } from "./endpoints/PaymentWebhook";
import {
    ApiSecurity,
    ApiVisibility,
} from "@rocket.chat/apps-engine/definition/api";
import { SettingType } from "@rocket.chat/apps-engine/definition/settings";
import { URL } from "url";
import { SubscribeCommand } from "./commands/SubscribeCommand";

export class RazorpayNotificationApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    protected async extendConfiguration(
        configuration: IConfigurationExtend,
        environmentRead: IEnvironmentRead
    ): Promise<void> {
        await Promise.all(
            settings.map((setting) =>
                configuration.settings.provideSetting(setting)
            )
        );
        await configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new PaymentWebhook(this)],
        });
        const serverURL = await environmentRead
            .getServerSettings()
            .getValueById("Site_Url");
        const webhookEndPoint = this.getAccessors().providedApiEndpoints.find(
            (endpoint) => endpoint.path === "payment-webhook"
        );
        const webhookURL = webhookEndPoint
            ? new URL(webhookEndPoint.computedPath || "", serverURL).toString()
            : "";
        await configuration.settings.provideSetting({
            id: "webhook-url",
            i18nLabel: "Webhook URL (DO NOT CHANGE)",
            i18nDescription: "Add this webhook url to Razorpay webhooks with `payments.authorised` event selected.",
            required: false,
            type: SettingType.STRING,
            packageValue: "",
            value: webhookURL,
            public: false,
        });
        await configuration.slashCommands.provideSlashCommand(new SubscribeCommand(this));
    }
}
