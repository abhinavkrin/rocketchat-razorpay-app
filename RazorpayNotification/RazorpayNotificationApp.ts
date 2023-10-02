import {
    IAppAccessors,
    IAppInstallationContext,
    IConfigurationExtend,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { settings } from "./settings/settings";
import {
    ApiSecurity,
    ApiVisibility,
} from "@rocket.chat/apps-engine/definition/api";
import { SettingType } from "@rocket.chat/apps-engine/definition/settings";
import { SubscribeCommand } from "./commands/SubscribeCommand";
import { PaymentWebhook } from "./endpoints/PaymentWebhook";
import { InstallationTokenPersistence } from "./lib/InstallationTokenPersistence";
import { getWebhookUrl } from "./lib/getWebhookUrl";
import { RoomSubscriptionPersistence } from "./lib/RoomSubscriptionPersistence";
import { getRazorpayPaymentBlocks } from "./lib/getRazorpayPaymentBlocks";
import { NotifyPaymentProcessor } from "./lib/NotifyPaymentProcessor";

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
        const webhookUrl = await getWebhookUrl(this);
        await configuration.settings.provideSetting({
            id: "webhook-url",
            i18nLabel: "Webhook URL (DO NOT CHANGE)",
            i18nDescription:
                "Add this webhook url to Razorpay webhooks with `payments.authorized` event selected.",
            required: false,
            type: SettingType.STRING,
            packageValue: "",
            public: false,
            value: webhookUrl,
        });
        await configuration.slashCommands.provideSlashCommand(
            new SubscribeCommand(this)
        );
        await configuration.scheduler.registerProcessors([new NotifyPaymentProcessor()])
    }
    async onInstall(
        context: IAppInstallationContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<void> {
        const installationTokenPersistence = new InstallationTokenPersistence(
            persistence,
            read.getPersistenceReader()
        );
        await installationTokenPersistence.createToken();
    }
}
