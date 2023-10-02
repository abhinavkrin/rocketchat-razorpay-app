# Razorpay Payments Notification
Get notified about razorpay payments

# Guides
## Admin Setup
### Deploy to RocketChat
```
rc-apps deploy --url <rocketchat-server-url> --username <username> --password <password>
```
### Setting up webhook
You can find webhook url in the settings page of the app.
Set the webhook url on the razorpay dashboard with `payment.authorized` event.
*The webhook url is unique and is different for each installation*. Therefore, change the webhook in razorpay if you reinstall the app.
## Allow only specific user or roles
Go to App setting and set the users or roles which could subscribe a room to razorpay notification.

## Subscribe to razorpay payment notifications
In a room execute slash command
```
/razorpay subscribe
```
The room will then receive notification messages for successful payments

## Usubscribe to razorpay payment notifications
In a room execute slash command
```
/razorpay unsubscribe
```
