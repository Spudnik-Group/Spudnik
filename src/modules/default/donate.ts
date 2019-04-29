import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
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
	constructor(client: CommandoClient) {
		super(client, {
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
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof DonateCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessage(msg, "We'd love your help supporting the bot!\nYou can support us on [Patreon](https://www.patreon.com/spudnik)\n\nWe ❤️ You!");
	}
}
