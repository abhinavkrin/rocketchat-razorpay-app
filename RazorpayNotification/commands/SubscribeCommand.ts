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
import { RoomSubscriptionPersistence } from "../lib/RoomSubscriptionPersistence";
import { HELP_TEXT } from "../lib/constants";

const SubCommands = {
    subscribe: "subscribe",
    unsubscribe: "unsubscribe",
    help: "help"
}
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
        const [subCommand = "help"] = context.getArguments();
        switch(subCommand) {
            case SubCommands.subscribe:
                this.handleSubscribe(context, read, modify, http, persistence);
                break;
            case SubCommands.unsubscribe:
                this.handleUnsubscribe(context, read, modify, http, persistence);
            case SubCommands.help:
            default:
                this.handleHelp(context, read, modify, http, persistence);
        }
    }

    async handleSubscribe(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence
    ) {
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
        const roomPersistence = new RoomSubscriptionPersistence(persistence, read.getPersistenceReader());
        const messageBuilder = modify.getCreator().startMessage()
                .setRoom(room);
        if (isRoleAllowedToSubscribe || isUserAllowedToSubscribe) {
            // this.app.getLogger().log('Allowed to subscribe');
            const isSubscribed = await roomPersistence.isSubscribed(room);
            if (isSubscribed) {
                messageBuilder.setText(`*Already Subscribed* to razorpay payment notifcations`);
            } else {
                roomPersistence.addRoom(room, sender);
                messageBuilder.setText(`*Subscribed* to razorpay payment notifcations`);
            }
        } else {
            // not allowed to subscribe
            // this.app.getLogger().log('Not allowed to subscribe');
            messageBuilder.setText(`You do not have enough permission to subscribe to razorpay notifications. Check app settings to allow.`);
            await modify.getCreator().finish(messageBuilder);
        }
        await modify.getCreator().finish(messageBuilder);
    }

    async handleUnsubscribe(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence
    ) {
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
        const roomPersistence = new RoomSubscriptionPersistence(persistence, read.getPersistenceReader());
        const messageBuilder = modify.getCreator().startMessage()
                .setRoom(room);
        if (isRoleAllowedToSubscribe || isUserAllowedToSubscribe) {
            // this.app.getLogger().log('Allowed to subscribe');
            const isSubscribed = await roomPersistence.isSubscribed(room);
            if (isSubscribed) {
                try {
                    roomPersistence.removeRoom(room);
                } catch (e) {
                    this.app.getLogger().log(e);
                }
                messageBuilder.setText(`*Unsubscribed* to razorpay payment notifcations`);
            } else {
                messageBuilder.setText(`Nothing to do since room is not subscribed to razorpay notifications.`);
            }
        } else {
            // not allowed to subscribe
            // this.app.getLogger().log('Not allowed to subscribe');
            messageBuilder.setText(`You do not have enough permission to unsubscribe to razorpay notifications. Check app settings to allow.`);
            await modify.getCreator().finish(messageBuilder);
        }
        await modify.getCreator().finish(messageBuilder);
    }

    async handleHelp(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence
    ) {
        const sender = context.getSender();
        const room = context.getRoom();
        const messageBuilder = modify.getCreator().startMessage()
                .setRoom(room)
                .setText(HELP_TEXT);
        await modify.getCreator().finish(messageBuilder);
    }
}
