import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getRandomInt, startTyping, stopTyping } from '../../lib/helpers';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';

const { smiff }: { smiff: string[] } = require('../../extras/data');

/**
 * Post a random Will Smith fact.
 *
 * @export
 * @class SmiffFactCommand
 * @extends {Command}
 */
export default class SmiffFactCommand extends Command {
	/**
	 * Creates an instance of SmiffFactCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof SmiffFactCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['smith-fact', 'willsmith'],
			description: 'Returns a random Will Smith fact.',
			examples: ['!smiff-fact'],
			group: 'facts',
			guildOnly: true,
			memberName: 'smiff-fact',
			name: 'smiff-fact',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "smiff-fact" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof SmiffFactCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		const responseEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			title: 'Will Smith Fact'
		});

		startTyping(msg);
		
		responseEmbed.setDescription(smiff[getRandomInt(0, smiff.length) - 1]);

		deleteCommandMessages(msg);
		stopTyping(msg);

		// Send the success response
		return msg.embed(responseEmbed);
	}
}
