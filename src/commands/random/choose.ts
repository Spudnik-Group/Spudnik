/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { getRandomInt } from '@lib/utils/util';

/**
 * Post a random choice of 2 options.
 *
 * @export
 * @class ChooseCommand
 * @extends {Command}
 */
export default class ChooseCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Have the bot choose something for you.',
			usage: '<choice:string> <choice:string> [...]'
		});
	}

	/**
	 * Run the "choose" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ choices: string[] }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ChooseCommand
	 */
	public async run(msg: KlasaMessage, [...choices]: string[]): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendEmbed(baseEmbed(msg)
			.setAuthor(`${msg.client.user.username}`, msg.client.user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(`I choose ${choices[getRandomInt(0, choices.length - 1)]}`)
			.setTitle(':thinking:'), '', { reply: msg.author });
	}

}
