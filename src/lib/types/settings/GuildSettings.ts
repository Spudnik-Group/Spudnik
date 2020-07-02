import { T } from './Shared';
import { IWarning } from '@lib/interfaces/warning';
import { ITOSMessage } from '@lib/interfaces/tos-message';

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

	export namespace Announce {
		export const Channel = T<string>('announce.channel');
	}

	export namespace Modlog {
		export const InitialMessageSent = T<boolean>('modlog.initialMessageSent');
		export const Enabled = T<boolean>('modlog.enabled');
		export const Channel = T<string>('modlog.channel');
	}

	export namespace Tos {
		export const Channel = T<string>('tos.channel');
		export const Role = T<string>('tos.role');
		export namespace Welcome {
			export const Enabled = T<boolean>('tos.welcome.enabled');
			export const Message = T<string>('tos.welcome.message');
		}
		export const Messages = T<ITOSMessage[]>('tos.messages');
	}

	export const Language = T<string>('language');

	export const Warnings = T<IWarning[]>('warnings');
}
