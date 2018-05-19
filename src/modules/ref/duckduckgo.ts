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
			description: 'Used to retrieve an instant answer from DuckDuckGo.',
			group: 'ref',
			guildOnly: true,
			memberName: 'ddg',
			name: 'ddg',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'query',
					prompt: 'what did you want DuckDuckGo to look up?\n',
					type: 'string',
				},
			],
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
		const ddgEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			footer: {
				text: 'results from DuckDuckGo',
				icon_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/DuckDuckGo_logo_and_wordmark_%282014-present%29.svg/150px-DuckDuckGo_logo_and_wordmark_%282014-present%29.svg.png',
			},
			description: '',
		});

		ddg.request(args.query, (err, response, body) => {
			if (err !== undefined && err !== null) {
				sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?');
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
		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	}
}
