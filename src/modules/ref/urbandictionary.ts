import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, stopTyping } from '../../lib/helpers';

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
	constructor(client: CommandoClient) {
		super(client, {
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
	 * @param {CommandoMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof UrbanCommand
	 */
	public async run(msg: CommandoMessage, args: { query: string }): Promise<Message | Message[]> {
		const targetWord = args.query === '' ? require('urban-dictionary').random() : require('urban-dictionary').term(args.query);
		const responseEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: ''
		});

		startTyping(msg);

		return targetWord.then((json: any) => {
			responseEmbed.setTitle(`Urban Dictionary: ${args.query}`);
			
			if (json) {
				responseEmbed.setTitle(`Urban Dictionary: ${json.entries[0].word}`);
				responseEmbed.setDescription(stripIndents`
					${json.entries[0].definition}\n
					${json.entries[0].example ? `Example: ${json.entries[0].example}` : ''}\n
					\n
					${json.entries[0].permalink}
				`);
			} else {
				responseEmbed.setDescription('No matches found');
			}

			deleteCommandMessages(msg);
			stopTyping(msg);
	
			// Send the success response
			return msg.embed(responseEmbed);
		})
		.catch((err: Error) => {
			msg.client.emit('warn', `Error in command ref:urban: ${err}`);
			
			stopTyping(msg);

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		});
	}
}
