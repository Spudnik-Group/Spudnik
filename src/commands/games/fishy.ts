/**
 * Copyright (c) 2020 Spudnik Group
 */

import { getRandomInt } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import * as fishes from '../../extras/fish.json';

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
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['fish', 'fishing'],
			description: 'Go fishing.',
			name: 'fishy'
		});
	}

	/**
	 * Run the "Slots" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof SlotsCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
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
		const worth = getRandomInt(fish.min, fish.max);

		return msg.sendMessage(`You caught a ${fish.symbol}. I bet it'd sell for around $${worth}.`, { reply: msg.author });
	}

}
