import { stripIndents } from 'common-tags';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

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
			description: 'Unshorten a link.',
			extendedHelp: stripIndents`
				syntax: \`!unshort <short link>\`
			`,
			name: 'unshort',
			usage: '<query:string>'
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
	public async run(msg: KlasaMessage, [query]): Promise<KlasaMessage | KlasaMessage[]> {
		try {
			const url: string = await require('url-unshort')().expand(query);
			if (url) {
				// Send the success response
				return sendSimpleEmbeddedMessage(msg, `Original url is: <${url}>`);
			}

			return sendSimpleEmbeddedError(msg, 'This url can\'t be expanded. Make sure the protocol exists (Http/Https) and try again.', 3000);
		} catch (err) {
			msg.client.emit('warn', `Error in command misc:unshort: ${err}`);

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. The url may not be valid. Try again?', 3000);
		}
	}
}
