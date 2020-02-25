/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { getEmbedColor } from '@lib/helpers';
import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Returns MDN results for a query.
 *
 * @export
 * @class MdnReferenceCommand
 * @extends {Command}
 */
export default class MdnReferenceCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['jsdocs'],
			description: 'Returns results for the supplied query from the MDN.',
			extendedHelp: stripIndents`
				syntax: \`!mdn <query>\`
			`,
			name: 'mdn',
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<query:...string>'
		});
	}

	/**
	 * Run the "mdn" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof MdnReferenceCommand
	 */
	public async run(msg: KlasaMessage, [query]): Promise<KlasaMessage | KlasaMessage[]> {
		const mdnEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://i.imgur.com/xwbpIKG.png',
				name: 'Mozilla Developer Network',
				url: 'https://developer.mozilla.org/en-US/'
			},
			color: getEmbedColor(msg),
			description: ''
		});

		try {
			const { data: response } = await axios.get(`https://developer.mozilla.org/en-US/search.json?q=${encodeURIComponent(query)}`);
			if (!response.documents.length) {

				return msg.sendSimpleError('Your query did not return any results', 3000);
			}
			const firstRes = response.documents[0];

			// TODO: convert this to return a list of results, allow the user to choose an item to display
			mdnEmbed
				.setTitle(firstRes.title)
				.setURL(firstRes.url)
				.setDescription(stripIndents`
					${firstRes.excerpt.replace(/<[^>]*>/g, '`').replace(/``/g, '')}...
					${response.documents[1] ? `

					__Similar related pages__:
					${response.documents.slice(1, 4).map(({ url, slug }: any, index: any) => `${index + 1}) [${slug}](${url})`).join('\n')}` : ''}


					${firstRes.tags ? `__Tag${firstRes.tags.length === 1 ? '' : 's'}__:
					${firstRes.tags.join(', ')}` : ''}
				`)
				.setFooter(`${response.count} documents found for "${query}". ${response.count < 1 ? '' : `Showing results 1 to ${response.documents.length < 5 ? response.documents.length : '4'}`} | Article ID: ${response.documents[0].id}`);

			return msg.sendEmbed(mdnEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command dev:mdn: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

}
