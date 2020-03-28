/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { baseEmbed } from '@lib/helpers/embed-helpers';

/**
 * Post an XKCD comic.
 *
 * @export
 * @class XkcdCommand
 * @extends {Command}
 */
export default class XkcdCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns a given XKCD comic number (or the latest if nothing specified)',
			extendedHelp: stripIndents`
				Supplying no comic number returns the latest comic.`,
			name: 'xkcd',
			usage: '[comicNumber:number]'
		});
	}

	/**
	 * Run the "xkcd" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ comicNumber: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof XkcdCommand
	 */
	public async run(msg: KlasaMessage, [comicNumber]): Promise<KlasaMessage | KlasaMessage[]> {
		const xkcdEmbed: MessageEmbed = baseEmbed(msg);

		let url = 'http://xkcd.com/';

		if (comicNumber) {
			url += `${comicNumber}/`;
		}

		url += 'info.0.json';

		try {
			const { data: comic } = await axios.get(url);
			xkcdEmbed.setFooter(comic.alt);
			xkcdEmbed.setImage(comic.img);
			xkcdEmbed.setTitle(`XKCD ${comic.num} ${comic.title}`);

			// Send the success response
			return msg.sendEmbed(xkcdEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command misc:xkcd: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

}
