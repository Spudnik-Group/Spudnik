import { KlasaClient, CommandStore, KlasaMessage, Command } from "klasa";
import { sendSimpleEmbeddedMessage } from "../../lib/helpers";

/**
 * Post a donate link.
 *
 * @export
 * @class DonateCommand
 * @extends {Command}
 */
export default class DonateCommand extends Command {
	/**
	 * Creates an instance of DonateCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof DonateCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Returns options to donate to help support development and hosting of the bot.',
			guarded: true,
			name: 'donate'
		});
	}

	/**
	 * Run the "donate" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof DonateCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return sendSimpleEmbeddedMessage(msg, "We'd love your help supporting the bot!\nYou can support us on [Patreon](https://www.patreon.com/spudnik)\n\nWe ❤️ You!");
	}
}
