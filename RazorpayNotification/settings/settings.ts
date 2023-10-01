import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';

export const settings:ISetting[] = [
	{
		id: 'allowed-roles',
		i18nLabel: 'Allowed Roles (comma separated)',
		i18nDescription: 'Users with the following roles can subscribe to razorpay notifications. (Comma separated)',
		type: SettingType.STRING,
		required: false,
		public: false,
		packageValue: '',
		multiline: true,
	},
	{
		id: 'allowed-users',
		i18nLabel: 'Allowed Users (comma separated)',
		i18nDescription: 'Users can subscribe to razorpay notifications. (Comma separated)',
		type: SettingType.STRING,
		required: true,
		public: false,
		packageValue: '',
		multiline: true,
	},
]