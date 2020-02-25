/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';

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
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['1-in', 'one-in', 'lottery-classic'],
			description: 'Attempt to win with a 1 in 1000 (or your choice) chance of winning.',
			extendedHelp: 'syntax: \`!chance <chance of winning>\`',
			name: 'chance',
			usage: '(chance:int{1})'
		});

	}

	/**
	 * Run the "Chance" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ChanceCommand
	 */
	public async run(msg: KlasaMessage, [chance]): Promise<KlasaMessage | KlasaMessage[]> {
		const loss = Math.floor(Math.random() * (chance ? Number(chance) : 1000));
		if (!loss) { return msg.sendMessage('Nice job! 10/10! You deserve some cake!', { reply: msg.author }); }

		return msg.sendMessage('Nope, sorry, you lost.', { reply: msg.author });
	}

}
