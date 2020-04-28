/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import * as WikiJS from 'wikijs';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { shorten } from '@lib/utils/util';

/**
 * Post a summary from Wikipedia.
 *
 * @export
 * @class WikiCommand
 * @extends {Command}
 */
export default class WikiCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns the Wikipedia result of the supplied query. If no query is supplied, returns a random Wikipedia result.',
			name: 'wiki',
			usage: '[query:...string]'
		});
	}

	/**
	 * Run the "wiki" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof WikiCommand
	 */
	public async run(msg: KlasaMessage, [query]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		try {
			const data: any = query ? await WikiJS.default().search(query, 1) : WikiJS.default().random();
			const page: any = await WikiJS.default().page(data.results[0]);
			const summary: string = await page.summary();

			const messageOut: MessageEmbed = baseEmbed(msg);

			const sumText = summary.split('\n');
			let paragraph = sumText.shift();

			if (paragraph) {
				// Wikipedia API Limitation:
				// IPA phonetics are not returned in the summary but the parenthesis that they are encapsulated in are...
				paragraph = paragraph.replace(' ()', '').replace('()', '');
				messageOut.setDescription(`${shorten(paragraph)}...`);

				const thumbnail = await page.mainImage();
				messageOut.setThumbnail(thumbnail || 'https://i.imgur.com/fnhlGh5.png');
				messageOut.setFooter(`Read More: ${page.raw.fullurl}\n\nPowered by WikiJS and Wikipedia`, 'https://raw.githubusercontent.com/dijs/wiki/HEAD/img/wikijs.png');
				messageOut.setTitle(page.raw.title);
			} else {
				messageOut.setDescription('No results. Try again?');
			}

			// Send the success response
			return msg.sendEmbed(messageOut);
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:wiki: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

}
