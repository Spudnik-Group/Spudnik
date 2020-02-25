/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import { getEmbedColor, sendSimpleEmbeddedError, shorten } from '@lib/helpers';
import * as WikiJS from 'wikijs';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Post a summary from Wikipedia.
 *
 * @export
 * @class WikiCommand
 * @extends {Command}
 */
export default class WikiCommand extends Command {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns the summary of the first matching search result from Wikipedia.',
			name: 'wiki',
			usage: '<query:string>'
		});

		this.customizeResponse('query', 'Please supply a query');
	}

	/**
	 * Run the "wiki" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof WikiCommand
	 */
	public async run(msg: KlasaMessage, [query]): Promise<KlasaMessage | KlasaMessage[]> {
		try {
			const data: any = await WikiJS.default().search(query, 1);
			const page: any = await WikiJS.default().page(data.results[0]);
			const summary: string = await page.summary();

			const messageOut: MessageEmbed = new MessageEmbed({
				color: getEmbedColor(msg)
			});

			const sumText = summary.split('\n');
			let paragraph = sumText.shift();

			if (paragraph) {
				// Wikipedia API Limitation:
				// IPA phonetics are not returned in the summary but the parenthesis that they are encapsulated in are...
				paragraph = paragraph.replace(' ()', '').replace('()', '');
				paragraph = `${shorten(paragraph)}...`;

				messageOut.setThumbnail((page.thumbnail && page.thumbnail.source) || 'https://i.imgur.com/fnhlGh5.png');
				messageOut.setDescription(`${paragraph}\n\n${page.raw.fullurl}`);
				messageOut.setTitle(page.raw.title);
			} else {
				messageOut.setDescription('No results. Try again?');
			}

			// Send the success response
			return msg.sendEmbed(messageOut);
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:wiki: ${err}`);

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}

}
