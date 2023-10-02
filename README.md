# Razorpay Payments Notification
Get notified about Razorpay payments right into your RocketChat channel.

# Guides
## Admin Setup
### Deploy to RocketChat
```
rc-apps deploy --url <rocketchat-server-url> --username <username> --password <password>
```
### Setting up webhook
You can find the webhook URL on the settings page of the app.
Set the webhook URL on the Razorpay dashboard with `payment.authorized` event.
**The webhook URL is unique and is different for each installation**. Therefore, change the webhook in razorpay if you reinstall the app.
## Allow only specific users or roles
You can go to App settings and set the users or roles that could subscribe a room to Razorpay notification.

## Subscribe to Razorpay payment notifications
In a room execute the slash command
```
/razorpay subscribe
```
The room will then receive notification messages for successful payments

## Unsubscribe to Razorpay payment notifications
In a room execute the slash command
```
/razorpay unsubscribe
```
