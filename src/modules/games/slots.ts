import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
const slots = ['🍇', '🍊', '🍐', '🍒', '🍋'];

/**
 * Starts a game of Slots.
 *
 * @export
 * @class SlotsCommand
 * @extends {Command}
 */
export default class SlotsCommand extends Command {
	/**
	 * Creates an instance of SlotsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof SlotsCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Play a game of slots.',
			examples: ['!slots'],
			group: 'games',
			guildOnly: true,
			memberName: 'slots',
			name: 'slots'
		});

	}

	/**
	 * Run the "Slots" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof SlotsCommand
	 */
	public async run(msg: CommandoMessage, args: { space: string }): Promise<Message | Message[]> {
		const slotOne = slots[Math.floor(Math.random() * slots.length)];
		const slotTwo = slots[Math.floor(Math.random() * slots.length)];
		const slotThree = slots[Math.floor(Math.random() * slots.length)];
		if (slotOne === slotTwo && slotOne === slotThree) {
			return msg.reply(stripIndents`
				${slotOne}|${slotTwo}|${slotThree}
				Wow! You won! Great job... er... luck!
			`);
		}
		return msg.reply(stripIndents`
			${slotOne}|${slotTwo}|${slotThree}
			Aww... You lost... Guess it's just bad luck, huh?
		`);
	}
}
