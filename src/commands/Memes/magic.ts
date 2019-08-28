import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedImage, startTyping, stopTyping } from '../../lib/helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Display a magical gif of Shia Labeouf.
 *
 * @export
 * @class MagicCommand
 * @extends {Command}
 */
export default class MagicCommand extends Command {
	/**
	 * Creates an instance of MagicCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof MagicCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			clientPermissions: ['ATTACH_FILES'],
			description: 'Displays a magical gif of Shia Labeouf.',
			examples: ['!magic'],
			group: 'meme',
			guildOnly: true,
			memberName: 'magic',
			name: 'magic',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "magic" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof MagicCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		startTyping(msg);
		deleteCommandMessages(msg);
		stopTyping(msg);
		
		// Send the success response
		return sendSimpleEmbeddedImage(msg, 'https://media.giphy.com/media/12NUbkX6p4xOO4/giphy.gif');
	}
}
