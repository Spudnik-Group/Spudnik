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
	async run(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		await message.sendLocale('COMMAND_REBOOT').catch(err => this.client.emit('error', err));
		await Promise.all(this.client.providers.map(provider => provider.shutdown()));
		process.exit();

		return message.send('Restarting...');
	}
};
