import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

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
					prompt: 'your statement, I must have.\n',
					type: 'string'
				}
			],
			description: 'Translate to Yoda speak.',
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
		require('soap').createClient('http://www.yodaspeak.co.uk/webservice/yodatalk.php?wsdl', (err: Error, client: any) => {
			if (err) {
				return sendSimpleEmbeddedMessage(msg, 'Lost, I am. Not found, the web service is. Hrmm...');
			}

			client.yodaTalk({ inputText: args.query }, (err: Error, result: any) => {
				if (err) {
					return sendSimpleEmbeddedMessage(msg, 'Confused, I am. Disturbance in the force, there is. Hrmm...');
				}
				msg.delete();
				return sendSimpleEmbeddedMessage(msg, result.return);
			});
		});
		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	}
}
