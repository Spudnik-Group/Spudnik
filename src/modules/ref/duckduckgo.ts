import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { Requester } from 'node-duckduckgo';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Post instant answer from DuckDuckGo.
 *
 * @export
 * @class DdgCommand
 * @extends {Command}
 */
export default class DdgCommand extends Command {
	/**
	 * Creates an instance of DdgCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof DdgCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'query',
					prompt: 'What did you want to look up on DuckDuckGo?\n',
					type: 'string'
				}
			],
			description: 'Returns an instant answer from DuckDuckGo for the supplied query.',
			details: stripIndents`
				syntax: \`!ddg <query>\`
			`,
			examples: [
				'!ddg fortnite',
				'!ddg github'
			],
			group: 'ref',
			guildOnly: true,
			memberName: 'ddg',
			name: 'ddg',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "ddg" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof DdgCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		const ddg = new Requester('Spudnik Discord Bot');
		ddg.no_html = 1;
		ddg.no_redirect = 1;
		const response = await sendSimpleEmbeddedMessage(msg, 'Loading...');
		const ddgEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			footer: {
				icon_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/DuckDuckGo_logo_and_wordmark_%282014-present%29.svg/150px-DuckDuckGo_logo_and_wordmark_%282014-present%29.svg.png',
				text: 'results from DuckDuckGo'
			}
		});

		ddg.request(args.query, (err, response, body) => {
			if (err !== undefined && err !== null) {
				msg.client.emit('warn', `Error in command ref:ddg: ${err}`);
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			} else if (typeof body !== 'undefined') {
				const result = JSON.parse(body);
				if (result.answer) {
					ddgEmbed.description = `\n${result.answer}\n\n`;
				} else if (result.Abstract) {
					ddgEmbed.description = `\n${result.Abstract}\n\n`;
				}
			} else {
				ddgEmbed.description = 'I don\'t have an answer for that query';
			}
			return msg.embed(ddgEmbed);
		});
		return response;
	}
}
