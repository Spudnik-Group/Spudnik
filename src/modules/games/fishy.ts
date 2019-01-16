import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { randomRange } from '../../lib/helpers';
//tslint:disable-next-line
const fishes = require('../../extras/fishy');

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
			aliases: ['fish', 'fishing'],
			description: 'Go fishing.',
			examples: ['!fishy'],
			group: 'games',
			guildOnly: true,
			memberName: 'fishy',
			name: 'fishy'
		});

	}

	/**
	 * Run the "Slots" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof SlotsCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		const fishID = Math.floor(Math.random() * 10) + 1;
		let rarity;
		if (fishID < 5) {
			rarity = 'junk';
		} else if (fishID < 8) {
			rarity = 'common';
		} else if (fishID < 10) {
			rarity = 'uncommon';
		} else {
			rarity = 'rare';
		}
		const fish = fishes[rarity];
		const worth = randomRange(fish.min, fish.max);
		return msg.reply(`You caught a ${fish.symbol}. I bet it'd sell for around $${worth}.`);
	}
}
