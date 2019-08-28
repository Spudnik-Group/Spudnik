import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Post a donate link.
 *
 * @export
 * @class DonateCommand
 * @extends {Command}
 */
export default class DonateCommand extends Command {
	/**
	 * Creates an instance of DonateCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof DonateCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Returns options to donate to help support development and hosting of the bot.',
			examples: ['!donate'],
			group: 'default',
			guarded: true,
			guildOnly: true,
			memberName: 'donate',
			name: 'donate',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "donate" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof DonateCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessage(msg, "We'd love your help supporting the bot!\nYou can support us on [Patreon](https://www.patreon.com/spudnik)\n\nWe ❤️ You!");
	}
}
