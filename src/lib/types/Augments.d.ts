import { MessageEmbedAuthor, MessageOptions } from 'discord.js';
import { CustomGet } from './settings/Shared';

declare module 'klasa' {
	interface KlasaMessage {
		ask(options?: MessageOptions, promptOptions?: MessageAskOptions): Promise<boolean>;
		ask(content: string, options?: MessageOptions, promptOptions?: MessageAskOptions): Promise<boolean>;
		sendSimpleEmbed(content: string, timeout?: number | null): Promise<KlasaMessage | KlasaMessage[]>;
		sendSimpleEmbedWithAuthor(content: string, author?: MessageEmbedAuthor, timeout?: number | null): Promise<KlasaMessage | KlasaMessage[]>;
		sendSimpleEmbedWithTitle(content: string, title: string, timeout?: number | null): Promise<KlasaMessage | KlasaMessage[]>;
		sendSimpleEmbedWithAuthorAndTitle(content: string, author?: MessageEmbedAuthor, title?: string, timeout?: number | null): Promise<KlasaMessage | KlasaMessage[]>;
		sendSimpleError(content: string, timeout?: number | null): Promise<KlasaMessage | KlasaMessage[]>;
		sendSimpleSuccess(content: string, timeout?: number | null): Promise<KlasaMessage | KlasaMessage[]>;
		sendSimpleImage(content: string, url: string, timeout?: number | null): Promise<KlasaMessage | KlasaMessage[]>;
		sendSimpleEmbedReply(content: string | null): Promise<KlasaMessage | KlasaMessage[]>;
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

	interface MessageEmbedAuthor {
		name?: string;
		url?: string;
		iconURL?: string;
		proxyIconURL?: string;
	}
}
