import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Simulate dice rolling.
 * 
 * @export
 * @class RollCommand
 * @extends {Command}
 */
export default class RollCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			name: 'roll',
			group: 'misc',
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
		if (args.roll.split('d').length > 1) {
			const eachDie = args.roll.split('+');
			let passing = 0;
			let response = '';
			for (const i in eachDie) {
				if (+eachDie[i].split('d')[0] < 50) {
					passing += 1;
				}
			}
			if (passing === eachDie.length) {
				response = `${msg.author} rolled a ${require('d20').roll(args.roll)}`;
			} else {
				response = `${msg.author} tried to roll too many dice at once!`;
			}

			return sendSimpleEmbeddedMessage(msg, `${response}`);
		}
		return sendSimpleEmbeddedError(msg, `${msg.author} rolled a ${require('d20').roll(args.roll)}`);
	}
}
