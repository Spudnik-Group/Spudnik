import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { startTyping, sendSimpleEmbeddedError, stopTyping } from '../../lib/helpers';
import { getEmbedColor } from '../../lib/custom-helpers';
import * as rp from 'request-promise';
import * as format from 'date-fns/format';

const apikey = process.env.spud_stackoverflowapi;

/**
 * Returns Stack Overflow results for a query.
 *
 * @export
 * @class StackOverflowCommand
 * @extends {Command}
 */
export default class StackOverflowCommand extends Command {
	/**
	 * Creates an instance of StackOverflowCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof StackOverflowCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'query',
					prompt: 'What question would you like to search for?',
					type: 'string'
				}
			],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Returns results for the supplied query from Stack Overflow.',
			details: stripIndents`
				syntax: \`!stack-overflow <query>\`
			`,
			examples: [
				'!stack-overflow tabs vs spaces'
			],
			group: 'dev',
			guildOnly: true,
			memberName: 'stack-overflow',
			name: 'stack-overflow',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "stack-overflow" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof StackOverflowCommand
	 */
	public async run(msg: CommandoMessage, args: { query: string }): Promise<Message | Message[]> {
		const stackEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://i.imgur.com/b4Hhl8y.png',
				name: 'Stack Overflow',
				url: 'https://stackoverflow.com'
			},
			color: getEmbedColor(msg),
			description: ''
		});
		const queryParams = `q=${encodeURIComponent(args.query)}&page=1&pagesize=1&order=asc&sort=relevance&answers=1&site=stackoverflow&key=${apikey}`;

		startTyping(msg);

		return rp.get({
			gzip: true,
			json: true,
			uri: `https://api.stackexchange.com/2.2/search/advanced?${queryParams}`
		})
			.then((res: any) => {
				const data = res;
				if (!data.items) {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, 'Your query did not return any results', 3000)
				}
				const firstRes = data.items[0];

				stackEmbed
					.setURL(firstRes.link)
					.setTitle(firstRes.title)
					.addField('❯ ID', firstRes.question_id, true)
					.addField('❯ Asker', `[${firstRes.owner.display_name}](${firstRes.owner.link})`, true)
					.addField('❯ Views', firstRes.view_count, true)
					.addField('❯ Score', firstRes.score, true)
					.addField('❯ Creation Date', format(firstRes.creation_date * 1000, 'MM/DD/YYYY h:mm A'), true)
					.addField('❯ Last Activity', format(firstRes.last_activity_date * 1000, 'MM/DD/YYYY h:mm A'), true);
				stopTyping(msg);
				
				return msg.embed(stackEmbed)
			})
			.catch((response) => {
				stopTyping(msg);
				msg.client.emit('warn', `Error in command dev:stack-overflow: ${response}`);

				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
	}
}
