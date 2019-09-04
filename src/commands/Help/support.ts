import { sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Post a link to the Spudnik Command Discord Server.
 *
 * @export
 * @class SupportCommand
 * @extends {Command}
 */
export default class SupportCommand extends Command {
	/**
	 * Creates an instance of SupportCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof SupportCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Returns a link to my support server!',
			guarded: true,
			name: 'support'
		});
	}

	/**
	 * Run the "support" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof SupportCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return sendSimpleEmbeddedMessage(msg, '<https://spudnik.io/support>');
	}
}
