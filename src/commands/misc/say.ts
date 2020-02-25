/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * States a message as the bot.
 *
 * @export
 * @class SayCommand
 * @extends {Command}
 */
export default class SayCommand extends Command {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns the text provided.',
			name: 'say',
			usage: '<text:...string>'
		});
	}

	/**
	 * Run the "say" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ text: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof SayCommand
	 */
	public async run(msg: KlasaMessage, [text]): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendMessage(text);
	}

}
