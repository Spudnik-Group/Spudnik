import { T } from './Shared';

/* eslint-disable @typescript-eslint/no-namespace */

export namespace GuildSettings {
	export const Prefix = T<string>('prefix');
	export const EmbedColor = T<string>('embedColor');
	export const AdblockEnabled = T<boolean>('adblockEnabled');

	export namespace Commands {
		export const DeleteCommandMessages = T<boolean>('commands.deleteMessages');
		export const Disabled = T<string[]>('commands.disabled');
		export const DisabledCategories = T<string[]>('commands.disabledCategories');
	}

	export namespace Roles {
		export const Default = T<string>('roles.default');
		export const Muted = T<string>('roles.muted');
		export const SelfAssignable = T<string[]>('roles.selfAssignable');
	}

	export namespace Starboard {
		export const Enabled = T<boolean>('starboard.enabled');
		export const Channel = T<string>('starboard.channel');
		export const Trigger = T<string>('starboard.trigger');
	}

	export namespace Welcome {
		export const Enabled = T<boolean>('welcome.enabled');
		export const Channel = T<string>('welcome.channel');
		export const Message = T<string>('welcome.message');
	}

	export namespace Goodbye {
		export const Enabled = T<boolean>('goodbye.enabled');
		export const Channel = T<string>('goodbye.channel');
		export const Message = T<string>('goodbye.message');
	}

	export namespace Modlog {
		export const InitialMessageSent = T<boolean>('modlog.initialMessageSent');
		export const Enabled = T<boolean>('modlog.enabled');
		export const Channel = T<string>('modlog.channel');
	}

	export namespace Tos {
		export const Channel = T<string>('tos.channel');
		export const Messages = T<TosMessage[]>('tos.messages');
	}

	export const Warnings = T<Warning[]>('warnings');
}

export interface TosMessage {
	id: number;
	title: string;
	body: string;
}

export interface Warning {
	id: string;
	points: number;
}