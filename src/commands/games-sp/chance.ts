/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { stripIndents } from 'common-tags';

/**
 * Starts a game of Chance.
 *
 * @export
 * @class ChanceCommand
 * @extends {Command}
 */
export default class ChanceCommand extends Command {

	/**
	 * Creates an instance of ChanceCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ChanceCommand
	 */
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['1-in', 'one-in', 'lottery-classic'],
			description: 'Attempt to win with a 1 in 1000 (or your choice) chance of winning.',
			usage: '[chance:int{1}]'
		});

	}

	/**
	 * Run the "Chance" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ChanceCommand
	 */
	public async run(msg: KlasaMessage, [chance = 1000]: [number]): Promise<KlasaMessage | KlasaMessage[]> {
		const loss = Math.floor(Math.random() * chance);
		if (!loss) {
			return msg.sendSimpleEmbedReply(stripIndents`
				Chance: 1 out of ${chance}
				Nailed it! You won!
			`);
		}

		return msg.sendSimpleEmbedReply(stripIndents`
			Chance: 1 out of ${chance}
			Sorry, you lost!
		`);
	}

}
