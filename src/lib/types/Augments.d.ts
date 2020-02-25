import { MessageOptions } from 'discord.js';
import { CustomGet } from './settings/Shared';

declare module 'klasa' {
	interface KlasaMessage {
		ask(options?: MessageOptions, promptOptions?: MessageAskOptions): Promise<boolean>;
		ask(content: string, options?: MessageOptions, promptOptions?: MessageAskOptions): Promise<boolean>;
		//sendSuccess(content: string): Promise<KlasaMessage | KlasaMessage[]>;
		sendSimpleEmbed(content: string, timeout?: number | null): Promise<KlasaMessage | KlasaMessage[]>;
	}

	interface MessageAskOptions {
		time?: number;
		max?: number;
	}

	interface SettingsFolder {
		get<K extends string, S>(key: CustomGet<K, S>): S;
	}
}

declare module 'discord.js' {
	interface MessageEmbed {
		// color
	}
}