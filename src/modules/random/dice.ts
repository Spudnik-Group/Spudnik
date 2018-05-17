import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Simulate dice rolling.
 *
 * @export
 * @class RollCommand
 * @extends {Command}
 */
export default class RollCommand extends Command {
	/**
	 * Creates an instance of RollCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof RollCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			name: 'roll',
			group: 'random',
			memberName: 'roll',
			guildOnly: true,
			description: 'roll one die with x sides, or multiple dice using d20 syntax. Default value is 10',
			details: '[# of sides] or [# of dice]d[# of sides]( + [# of dice]d[# of sides] + ...)',
			args: [
				{
					default: '6',
					key: 'roll',
					prompt: 'What die combo would you like to roll?',
					type: 'string',
				},
			],
		});
	}

	/**
	 * Run the "roll" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ roll: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof RollCommand
	 */
	public async run(msg: CommandMessage, args: { roll: string }): Promise<Message | Message[]> {
		return sendSimpleEmbeddedMessage(msg, `${msg.author} rolled a ${require('d20').roll(args.roll)}`);
	}
}
