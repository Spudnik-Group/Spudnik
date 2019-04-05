import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, startTyping, stopTyping, deleteCommandMessages } from '../../lib/helpers';

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
			args: [
				{
					key: 'query',
					prompt: 'What link should I unshorten?\n',
					type: 'string'
				}
			],
			description: 'Unshorten a link.',
			details: stripIndents`
				syntax: \`!unshort <short link>\`
			`,
			examples: [
				'!unshort http://bit.ly/Wn2Xdz',
				'!unshorten http://bit.ly/Wn2Xdz'
			],
			group: 'misc',
			guildOnly: true,
			memberName: 'unshort',
			name: 'unshort',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "unshorten" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof UnshortCommand
	 */
	public async run(msg: CommandoMessage, args: { query: string }): Promise<Message | Message[]> {
		let embedMessage = '';
		startTyping(msg);

		return require('url-unshort')().expand(args.query)
			.then((url: string) => {
				if (url) {
					deleteCommandMessages(msg, this.client);
					stopTyping(msg);
					embedMessage = `Original url is: <${url}>`;
		
					deleteCommandMessages(msg, this.client);
					stopTyping(msg);
					
					// Send the success response
					return sendSimpleEmbeddedMessage(msg, embedMessage);
				}
				stopTyping(msg);
				return sendSimpleEmbeddedError(msg, 'This url can\'t be expanded. Make sure the protocol exists (Http/Https) and try again.', 3000);
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command misc:unshort: ${err}`);
				stopTyping(msg);
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. The url may not be valid. Try again?', 3000);
			});
	}
}
