import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, startTyping, deleteCommandMessages, stopTyping } from '../../lib/helpers';

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
			args: [
				{
					infinite: true,
					key: 'rolls',
					prompt: 'What die combo would you like to roll?',
					type: 'string'
				}
			],
			description: 'Roll one die with x sides, or multiple dice using d20 syntax.',
			details: 'syntax: `!roll <# of sides|[# of dice]d[# of sides]+modifiers [# of dice]d[# of sides]+modifiers ...>`\n\nYou can supply an infinite number of rolls.',
			examples: [
				'!roll 2d20',
				'!roll 4d8+2',
				'!roll 2d8+2 4d6'
			],
			group: 'random',
			guildOnly: true,
			memberName: 'roll',
			name: 'roll'
		});
	}

	/**
	 * Run the "roll" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ rolls: string[] }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof RollCommand
	 */
	public async run(msg: CommandoMessage, args: { rolls: string[] }): Promise<Message | Message[]> {
		const input: string[] = args.rolls;
		const diceEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			title: ':game_die: Dice Roller'
		});

		startTyping(msg);

		input.forEach((item) => {
			const result = require('d20').roll(item);
			diceEmbed.description += `Roll: ${item} -- Result: ${result}\n`;
		});
		
		deleteCommandMessages(msg, this.client);
		stopTyping(msg);

		// Send the success response
		return msg.embed(diceEmbed);
	}
}
