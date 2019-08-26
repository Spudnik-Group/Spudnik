import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, stopTyping } from '../../lib/helpers';

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
			args: [
				{
					default: '',
					key: 'query',
					prompt: 'What should I look up on Urban Dictionary?\n',
					type: 'string'
				}
			],
			description: 'Returns the Urban Dictionary result of the supplied query. If no query is supplied, returns a random thing.',
			details: stripIndents`
				syntax: \`!urban (query)\`

				Supplying no query will return a random result.
				Urban Dictionary results are NSFW.
			`,
			examples: [
				'!urban',
				'!urban shorty'
			],
			group: 'ref',
			guildOnly: true,
			memberName: 'urban',
			name: 'urban',
			nsfw: true,
			throttling: {
				duration: 3,
				usages: 2
			}
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
	public async run(msg: KlasaMessage, args: { query: string }): Promise<KlasaMessage | KlasaMessage[]> {
		const targetWord = args.query === '' ? UD.random() : UD.term(args.query);
		const responseEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: ''
		});

		startTyping(msg);

		try {
			const response: any = await targetWord;
			responseEmbed.setTitle(`Urban Dictionary: ${args.query}`);
			
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

			deleteCommandMessages(msg);
			stopTyping(msg);
	
			// Send the success response
			return msg.embed(responseEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:urban: ${err}`);
			
			stopTyping(msg);

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}
}
