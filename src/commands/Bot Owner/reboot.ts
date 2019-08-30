/**
 * Copyright 2019 - Spudnik Group
 *
 * @summary Reboots the bot.
 * @author Spudnik Group <comrades@spudnik.io> (https://spudnik.io)
 *
 * Created at     : 2019-08-30 11:47:42 
 * Last modified  : 2019-08-30 12:32:38
 */

import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

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
			permissionLevel: 10,
			guarded: true,
			description: language => language.get('COMMAND_REBOOT_DESCRIPTION')
		});
	}

	/**
	 * Run the "Reboot" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof RebootCommand
	 */
	async run(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		await message.sendLocale('COMMAND_REBOOT').catch(err => this.client.emit('error', err));
		await Promise.all(this.client.providers.map(provider => provider.shutdown()));
		process.exit();
		
		return message.send('Restarting...');
	}
};
