import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { startTyping, stopTyping } from '../../lib/helpers';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Convert text to 1337 speak.
 *
 * @export
 * @class LeetCommand
 * @extends {Command}
 */
export default class LeetCommand extends Command {
	/**
	 * Creates an instance of LeetCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof LeetCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'query',
					prompt: '61v3 m3 4 qu3ry.\n',
					type: 'string'
				}
			],
			description: 'Converts boring regular text to 1337.',
			details: stripIndents`
				syntax: \`!leet <text>\`
			`,
			examples: ['!leet Give me better input than this'],
			group: 'translate',
			guildOnly: true,
			memberName: 'leet',
			name: 'leet',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "leet" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof LeetCommand
	 */
	public async run(msg: CommandoMessage, args: { query: string }): Promise<Message | Message[]> {
		const leetEmbed: MessageEmbed = new MessageEmbed({
			author: {
				iconURL: 'https://avatarfiles.alphacoders.com/149/149303.jpg',
				name: '1337 5P34KZORZ'
			},
			color: getEmbedColor(msg)
		});

		startTyping(msg);

		const leetResponse = require('leet').convert(args.query);

		leetEmbed.setDescription(leetResponse);

		deleteCommandMessages(msg);
		stopTyping(msg);
		
		return msg.embed(leetEmbed);
	}
}
