/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { Command, CommandStore, KlasaMessage } from 'klasa';

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
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Play a game of slots.'
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
		const slotOne = slots[Math.floor(Math.random() * slots.length)];
		const slotTwo = slots[Math.floor(Math.random() * slots.length)];
		const slotThree = slots[Math.floor(Math.random() * slots.length)];
		if (slotOne === slotTwo && slotOne === slotThree) {
			return msg.sendMessage(stripIndents`
				${slotOne}|${slotTwo}|${slotThree}
				Wow! You won! Great job... er... luck!
			`);
		}

		return msg.sendMessage(stripIndents`
			${slotOne}|${slotTwo}|${slotThree}
			Aww... You lost... Guess it's just bad luck, huh?
		`, { reply: msg.author });
	}

}
