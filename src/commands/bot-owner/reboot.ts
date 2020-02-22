/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Reboots the bot.
 *
 * @export
 * @class RebootCommand
 * @extends {Command}
 */
export default class RebootCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: language => language.get('COMMAND_REBOOT_DESCRIPTION'),
			guarded: true,
			hidden: true,
			permissionLevel: 10 // BOT OWNER
		});
	}

	/**
	 * Run the "Reboot" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof RebootCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		await Promise.all(this.client.providers.map(provider => provider.shutdown()));
		process.exit();

		return sendSimpleEmbeddedMessage(msg, 'Rebooting...');
	}
};
