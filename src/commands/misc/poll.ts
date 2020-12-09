/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
/**
 * Creates a simple poll.
 *
 * @export
 * @class ListWarnsCommand
 * @extends {Command}
 */
export default class ListWarnsCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['spoll'],
			description: 'Creates a simple poll.',
			usage: '<title:string>'
		});
	}

	/**
	 * Run the "list-warns" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ member: GuildMember, reason: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ListWarnsCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		for (const reaction of ['👍', '👎', '🤷']) {
			if (!msg.reactions.has(reaction)) await msg.react(reaction);
		}

		return msg;
	}

}
