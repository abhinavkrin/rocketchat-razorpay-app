import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { RazorpayNotificationApp } from "../RazorpayNotificationApp";

export class SubscribeCommand implements ISlashCommand {
    public constructor(private readonly app: RazorpayNotificationApp) {
        this.app = app;
    }
    public command = "razorpay";
    public i18nDescription = "command_razorpay_description";
    public providesPreview = false;
    public i18nParamsExample = "";

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence
    ): Promise<void> {
        const sender = context.getSender();
        const room = context.getRoom();
        const allowedUsers:string[] =
            (
                await read
                    .getEnvironmentReader()
                    .getSettings()
                    .getById("allowed-users")
            )?.value?.split(",") || [];
        const allowedRoles:string[] =
            (
                await read
                    .getEnvironmentReader()
                    .getSettings()
                    .getById("allowed-roles")
            )?.value?.split(",") || [];
        const isUserAllowedToSubscribe = allowedUsers.includes(sender.username);
        const isRoleAllowedToSubscribe = !!allowedRoles.find((role) =>  sender.roles.includes(role));
        if (isRoleAllowedToSubscribe || isUserAllowedToSubscribe) {
            // this.app.getLogger().log('Allowed to subscribe');
            const messageBuilder = modify.getCreator().startMessage()
                .setText(`Looks Good`)
                .setRoom(room);
            await modify.getCreator().finish(messageBuilder);
        } else {
            // not allowed to subscribe
            // this.app.getLogger().log('Not allowed to subscribe');
            const messageBuilder = modify.getCreator().startMessage()
                .setText(`You do not have enough permission to subscribe to razorpay notifications. Check app settings to allow.`)
                .setRoom(room);
            await modify.getCreator().finish(messageBuilder);
        }
    }
}
