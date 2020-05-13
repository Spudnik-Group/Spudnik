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
			name: 'choose',
			usage: '<choice:string> <choice:string> [...]',
			usageDelim: ', '
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
		const options: string[] = choices;
		if (options.length < 2) {
			return msg.sendSimpleError(`I can't choose for you if you don't give me more options!`, 3000);
		}

		return msg.sendEmbed(baseEmbed(msg)
			.setAuthor(`${msg.client.user.username}`, msg.client.user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(`I choose ${options[getRandomInt(0, options.length - 1)]}`)
			.setTitle(':thinking:'), '', { reply: msg.author });
	}

}
