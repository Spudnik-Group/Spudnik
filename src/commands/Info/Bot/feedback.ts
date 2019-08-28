import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Provides links to suggest features, submit bugs, or email the devs.
 *
 * @export
 * @class FeedbackCommand
 * @extends {Command}
 */
export default class FeedbackCommand extends Command {
	/**
	 * Creates an instance of FeedbackCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof FeedbackCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Provides links to suggest features, submit bugs, or email the devs.',
			examples: ['!feedback'],
			group: 'default',
			guarded: true,
			guildOnly: true,
			memberName: 'feedback',
			name: 'feedback',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "feedback" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof FeedbackCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessage(msg, `
			*Give us Feedback!*
			
			Make a [Feature Suggestion](<https://feathub.com/Spudnik-Group/Spudnik>)
			File a [GitHub Issue](<https://github.com/Spudnik-Group/Spudnik/issues/new/choose>)
			Email the Devs: comrades@spudnik.io
		`);
	}
}
