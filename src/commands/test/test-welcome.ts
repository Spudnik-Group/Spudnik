import { Command, CommandStore, KlasaMessage } from 'klasa';
// Import { delay } from '@lib/helpers';
// Import { getEmbedColor } from '@lib/helpers';

/**
 * Accept the guild rules, and be auto-assigned the default role.
 *
 * @export
 * @class AcceptCommand
 * @extends {Command}
 */

export default class TestWelcomeCommand extends Command {

public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['tw'],
			description: 'Accept the Terms of Use for the current guild.',
			name: 'test-welcome',
			requiredSettings: ['tos.channel', 'roles.default']
		});
	}

	/**
	 * Run the "accept" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ channel: Channel }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof TestWelcomeCommand
	 */
	public async run(msg: KlasaMessage) {
		if (await this.ask(msg, `Welcome <@${msg.author.id}>, do you accept the above terms-of-service?\nReact with ✅ for "yes".\nYou must react to the message with your username mentioned.`)) {
			return msg.send('yay');
		}
		return msg.send('ugh...');

	}

	private ask(msg: KlasaMessage, content: string) {
		try {
			return msg.ask(content);
		} catch {
			return null;
		}
	}

}
