import { MessageEmbed } from 'discord.js';
import { getEmbedColor } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { stripIndents } from 'common-tags';

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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Converts boring regular text to 1337.',
			extendedHelp: stripIndents`
				syntax: \`!leet <text>\`
			`,
			name: 'leet',
			usage: '<query:string>'
		});

		this.customizeResponse('query', '61v3 m3 4 qu3ry.');
	}

	/**
	 * Run the "leet" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof LeetCommand
	 */
	public async run(msg: KlasaMessage, [query]: any): Promise<KlasaMessage | KlasaMessage[]> {
		const leetEmbed: MessageEmbed = new MessageEmbed({
			author: {
				iconURL: 'https://avatarfiles.alphacoders.com/149/149303.jpg',
				name: '1337 5P34KZORZ'
			},
			color: getEmbedColor(msg)
		});

		const leetResponse = require('leet').convert(query);
		leetEmbed.setDescription(leetResponse);

		return msg.sendEmbed(leetEmbed);
	}
}
