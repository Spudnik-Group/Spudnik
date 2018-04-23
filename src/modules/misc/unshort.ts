import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Unshorten a url.
 * 
 * @export
 * @class UnshortCommand
 * @extends {Command}
 */
export default class UnshortCommand extends Command {
	/**
	 * Creates an instance of UnshortCommand.
	 * 
	 * @param {CommandoClient} client 
	 * @memberof UnshortCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['unshorten'],
			description: 'Unshorten a link.',
			group: 'misc',
			guildOnly: true,
			memberName: 'unshort',
			name: 'unshort',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'query',
					prompt: 'what link should I unshorten?\n',
					type: 'string',
				},
			],
		});
	}

	/**
	 * Run the "unshorten" command.
	 * 
	 * @param {CommandMessage} msg 
	 * @param {{ query: string }} args 
	 * @returns {(Promise<Message | Message[]>)} 
	 * @memberof UnshortCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		require('url-unshort')().expand(args.query)
			.then((url: string) => {
				if (url) {
					msg.delete();
					return sendSimpleEmbeddedMessage(msg, `Original url is: <${url}>`);
				}
				return sendSimpleEmbeddedError(msg, 'This url can\'t be expanded. Make sure the protocol exists (Http/Https) and try again.');
			});
		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	}
}
