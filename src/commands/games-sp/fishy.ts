/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { fishes } from '../../extras/fish';
import { getRandomInt } from '@lib/utils/util';

/**
 * Starts a game of Fishy.
 *
 * @export
 * @class FishyCommand
 * @extends {Command}
 */
export default class FishyCommand extends Command {

	/**
	 * Creates an instance of FishyCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof FishyCommand
	 */
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['fish', 'fishing'],
			description: 'Go fishing.'
		});
	}

	/**
	 * Run the "Fishy" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof FishyCommand
	 */
	public run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
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

		return msg.sendSimpleEmbedReply(`You caught a ${fish.symbol}. I bet it'd sell for around $${worth}.`);
	}

}
