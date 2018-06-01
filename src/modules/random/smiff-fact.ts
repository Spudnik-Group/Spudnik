import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getRandomInt, sendSimpleEmbeddedMessage } from '../../lib/helpers';

// tslint:disable-next-line:no-var-requires
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
			description: 'Gives a Random Will Smith Fact.',
			examples: ['!smifffact'],
			group: 'random',
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
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof SmiffFactCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		return sendSimpleEmbeddedMessage(msg, smiff[getRandomInt(0, smiff.length) - 1]);
	}
}
