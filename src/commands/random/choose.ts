/**
 * Copyright (c) 2020 Spudnik Group
 */

import { getEmbedColor, getRandomInt, sendSimpleEmbeddedError } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';

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
	public async run(msg: KlasaMessage, [...choices]): Promise<KlasaMessage | KlasaMessage[]> {
		const options: string[] = choices;
		if (options.length < 2) {
			return sendSimpleEmbeddedError(msg, 'I can\'t choose for you if you don\'t give me more options!', 3000);
		}

		return msg.sendEmbed(new MessageEmbed({
			author: {
				iconURL: msg.client.user.displayAvatarURL(),
				name: `${msg.client.user.username}`
			},
			color: getEmbedColor(msg),
			description: `I choose ${options[getRandomInt(0, options.length)]}`,
			title: ':thinking:'
		}), '', { reply: msg.author });
	}

}
