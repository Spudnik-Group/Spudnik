import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, stopTyping, startTyping, deleteCommandMessages } from '../../lib/helpers';

/**
 * Convert a statement to be structured as Yoda speaks.
 *
 * @export
 * @class YodifyCommand
 * @extends {Command}
 */
export default class YodifyCommand extends Command {
	/**
	 * Creates an instance of YodifyCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof YodifyCommand
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
				syntax: \`!yodify <text>\`
			`,
			examples: ['!yodify Give me better input than this'],
			group: 'translate',
			guildOnly: true,
			memberName: 'yodify',
			name: 'yodify',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "yodify" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof YodifyCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		let embedMessage = '';
		startTyping(msg);

		require('soap').createClient('http://www.yodaspeak.co.uk/webservice/yodatalk.php?wsdl', (err: Error, client: any) => {
			if (err) {
				msg.client.emit('warn', `Error in command translate:yodify: ${err}`);
				stopTyping(msg);
				return sendSimpleEmbeddedError(msg, 'Lost, I am. Not found, the web service is. Hrmm...', 3000);
			}

			client.yodaTalk({ inputText: args.query }, (err: Error, result: any) => {
				if (err) {
					msg.client.emit('warn', `Error in command translate:yodify: ${err}`);
					stopTyping(msg);
					return sendSimpleEmbeddedError(msg, 'Confused, I am. Disturbance in the force, there is. Hrmm...', 3000);
				}
				embedMessage = result.return;
			});
		});
	
		deleteCommandMessages(msg, this.client);
		stopTyping(msg);
		
		// Send the success response
		return sendSimpleEmbeddedMessage(msg, embedMessage);
	}
}
