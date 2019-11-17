import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { getEmbedColor, sendSimpleEmbeddedError } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

const UD = require('urban-dictionary');

/**
 * Post an Urban Dictionary definition.
 *
 * @export
 * @class UrbanCommand
 * @extends {Command}
 */
export default class UrbanCommand extends Command {
	/**
	 * Creates an instance of UrbanCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof UrbanCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Returns the Urban Dictionary result of the supplied query. If no query is supplied, returns a random thing.',
			name: 'urban',
			extendedHelp: stripIndents`
				syntax: \`!urban (query)\`
				Supplying no query will return a random result.
				Urban Dictionary results are NSFW.
			`,
			nsfw: true,
			usage: '<query:...string>'
		});
	}

	/**
	 * Run the "urban" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof UrbanCommand
	 */
	public async run(msg: KlasaMessage, [query]): Promise<KlasaMessage | KlasaMessage[]> {
		const responseEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: ''
		});

		try {
			const targetWord = query === '' ? UD.random() : UD.term(query);
			const response: any = await targetWord;
			responseEmbed.setTitle(`Urban Dictionary: ${query}`);

			if (response) {
				responseEmbed.setTitle(`Urban Dictionary: ${response.entries[0].word}`);
				responseEmbed.setDescription(stripIndents`
					${response.entries[0].definition}\n
					${response.entries[0].example ? `Example: ${response.entries[0].example}` : ''}\n
					\n
					${response.entries[0].permalink}
				`);
			} else {
				responseEmbed.setDescription('No matches found');
			}

			// Send the success response
			return msg.sendEmbed(responseEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:urban: ${err}`);

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}
}
