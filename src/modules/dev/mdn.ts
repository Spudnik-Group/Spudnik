import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { startTyping, sendSimpleEmbeddedError, stopTyping } from '../../lib/helpers';
import { getEmbedColor } from '../../lib/custom-helpers';
import axios from 'axios';

/**
 * Returns MDN results for a query.
 *
 * @export
 * @class MdnReferenceCommand
 * @extends {Command}
 */
export default class MdnReferenceCommand extends Command {
	/**
	 * Creates an instance of MdnReferenceCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof MdnReferenceCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['jsdocs'],
			args: [
				{
					key: 'query',
					prompt: 'What should I look up in the MDN?',
					type: 'string'
				}
			],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Returns results for the supplied query from the MDN.',
			details: stripIndents`
				syntax: \`!mdn <query>\`
			`,
			examples: [
				'!mdn object.entries'
			],
			group: 'dev',
			guildOnly: true,
			memberName: 'mdn',
			name: 'mdn',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "mdn" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof MdnReferenceCommand
	 */
	public async run(msg: CommandoMessage, args: { query: string }): Promise<Message | Message[]> {
		const mdnEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://i.imgur.com/xwbpIKG.png',
				name: 'Mozilla Developer Network',
				url: 'https://developer.mozilla.org/en-US/'
			},
			color: getEmbedColor(msg),
			description: ''
		});

		startTyping(msg);

		try {
			const response: any = await axios.get(`https://developer.mozilla.org/en-US/search.json?q=${encodeURIComponent(args.query)}`)
			if (!response.documents.length) {
				stopTyping(msg);
	
				return sendSimpleEmbeddedError(msg, 'Your query did not return any results', 3000)
			}
			const firstRes = response.documents[0];
	
			mdnEmbed
				.setTitle(firstRes.title)
				.setURL(firstRes.url)
				.setDescription(stripIndents`
					${firstRes.excerpt.replace(/<[^>]*>/g, '`').replace(/``/g, '')}...
					${response.documents[1] ? `
					
					__Similar related pages__:
					${response.documents.slice(1, 4).map(({ url, slug }: any, index: any) => `${index + 1}) [${slug}](${url})`).join('\n')}` : ''}
	
	
					__Tag${firstRes.tags.length === 1 ? '' : 's'}__:
					${firstRes.tags.join(', ')}
				`)
				.setFooter(`${response.count} documents found for "${args.query}". ${response.count < 1 ? '' : `Showing results 1 to ${response.documents.length < 5 ? response.documents.length : '4'}`} | Article ID: ${response.documents[0].id}`)
			stopTyping(msg);

			return msg.embed(mdnEmbed);
		} catch (err) {
			stopTyping(msg);
			msg.client.emit('warn', `Error in command dev:mdn: ${err}`);

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}
}
