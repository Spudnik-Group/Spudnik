import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, startTyping, stopTyping } from '../../lib/helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';

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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
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
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof UnshortCommand
	 */
	public async run(msg: KlasaMessage, args: { query: string }): Promise<KlasaMessage | KlasaMessage[]> {
		startTyping(msg);

		try {
			const url: string = await require('url-unshort')().expand(args.query);
			if (url) {
				deleteCommandMessages(msg);
				stopTyping(msg);
				
				// Send the success response
				return sendSimpleEmbeddedMessage(msg, `Original url is: <${url}>`);
			}

			deleteCommandMessages(msg);
			stopTyping(msg);
			
			return sendSimpleEmbeddedError(msg, 'This url can\'t be expanded. Make sure the protocol exists (Http/Https) and try again.', 3000);
		} catch (err) {
			msg.client.emit('warn', `Error in command misc:unshort: ${err}`);

			deleteCommandMessages(msg);
			stopTyping(msg);
			
			return sendSimpleEmbeddedError(msg, 'There was an error with the request. The url may not be valid. Try again?', 3000);
		}
	}
}
