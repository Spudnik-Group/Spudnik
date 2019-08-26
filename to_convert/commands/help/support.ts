import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Post a link to the Spudnik Command Discord Server.
 *
 * @export
 * @class SupportCommand
 * @extends {Command}
 */
export default class SupportCommand extends Command {
	/**
	 * Creates an instance of SupportCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof SupportCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Returns a link to my support server!',
			examples: ['!support'],
			group: 'help',
			guarded: true,
			guildOnly: true,
			memberName: 'support',
			name: 'support',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "support" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof SupportCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessage(msg, '<https://spudnik.io/support>');
	}
}
