import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, stopTyping, startTyping, deleteCommandMessages } from '../../lib/helpers';
import { getEmbedColor } from '../../lib/custom-helpers';

/**
 * Convert a statement to be structured as Yoda speaks.
 *
 * @export
 * @class YodafyCommand
 * @extends {Command}
 */
export default class YodafyCommand extends Command {
	/**
	 * Creates an instance of YodafyCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof YodafyCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'query',
					prompt: 'Your statement, I must have.\n',
					type: 'string'
				}
			],
			description: 'Translates text to Yoda speak.',
			details: stripIndents`
				syntax: \`!yodafy <text>\`
			`,
			examples: ['!yodafy Give me better input than this'],
			group: 'translate',
			guildOnly: true,
			memberName: 'yodafy',
			name: 'yodafy',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "yodafy" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof YodafyCommand
	 */
	public async run(msg: CommandoMessage, args: { query: string }): Promise<Message | Message[]> {
		const yodaEmbed: MessageEmbed = new MessageEmbed({
			author: {
				iconURL: 'https://avatarfiles.alphacoders.com/112/112847.jpg',
				name: 'Yoda speak. Hmmmmmm.'
			},
			color: getEmbedColor(msg),
			footer: {
				text: 'powered by: yodaspeak.co.uk'
			}
		});

		startTyping(msg);

		return require('soap').createClient('http://www.yodaspeak.co.uk/webservice/yodatalk.php?wsdl', (err: Error, client: any) => {
			if (err) {
				msg.client.emit('warn', `Error in command translate:yodafy: ${err}`);
				stopTyping(msg);
				
				return sendSimpleEmbeddedError(msg, 'Lost, I am. Not found, the web service is. Hrmm...', 3000);
			}

			client.yodaTalk({ inputText: args.query }, (err: Error, result: any) => {
				if (err) {
					msg.client.emit('warn', `Error in command translate:yodafy: ${err}`);
					stopTyping(msg);
					
					return sendSimpleEmbeddedError(msg, 'Confused, I am. Disturbance in the force, there is. Hrmm...', 3000);
				}
				
				yodaEmbed.setDescription(`${result.return}\n`);
			
				deleteCommandMessages(msg, this.client);
				stopTyping(msg);
				
				// Send the success response
				return msg.embed(yodaEmbed);
			});
		});
	}
}