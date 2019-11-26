import { sendSimpleEmbeddedImage } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Show the XKCD "Now" comic.
 *
 * @export
 * @class HighNoonCommand
 * @extends {Command}
 */
export default class HighNoonCommand extends Command {
	/**
	 * Creates an instance of HighNoonCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof HighNoonCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Displays the High Noon XKCD comic.',
			name: 'highnoon',
			requiredPermissions: ['ATTACH_FILES']
		});
	}

	/**
	 * Run the "highnoon" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof HighNoonCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return sendSimpleEmbeddedImage(msg, 'http://imgs.xkcd.com/comics/now.png', 'IT\'S HIGH NOON...');
	}
}
