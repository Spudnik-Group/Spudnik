import { MessageOptions } from 'discord.js';
import { CustomGet } from './settings/Shared';

declare module 'klasa' {
    interface KlasaMessage {
        ask(options?: MessageOptions, promptOptions?: MessageAskOptions): Promise<boolean>;
        ask(content: string, options?: MessageOptions, promptOptions?: MessageAskOptions): Promise<boolean>;
    }

    interface MessageAskOptions {
        time?: number;
        max?: number;
    }

    interface SettingsFolder {
        get<K extends string, S>(key: CustomGet<K, S>): S;
    }
}