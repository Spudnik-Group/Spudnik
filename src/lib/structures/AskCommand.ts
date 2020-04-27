import { Permissions } from 'discord.js';
import { Command, CommandOptions, CommandStore, KlasaMessage, util } from 'klasa';

export abstract class AskCommand extends Command {

	public spam: boolean;
	public requiredGuildPermissions: Permissions;

	public constructor(store: CommandStore, file: string[], directory: string, options: CommandOptions = {}) {
		super(store, file, directory, util.mergeDefault({ spam: false, requiredGuildPermissions: 0 }, options));
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public run(message: KlasaMessage, _params: any[]): any { return message; }

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public inhibit(_message: KlasaMessage): Promise<boolean> | boolean {
		return false;
	}

}