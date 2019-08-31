import { Command, KlasaClient, CommandStore, KlasaMessage } from "klasa";

/**
 * States a message as the bot.
 *
 * @export
 * @class SayCommand
 * @extends {Command}
 */
export default class SayCommand extends Command {
	/**
	 * Creates an instance of SayCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof SayCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Returns the text provided.',
			extendedHelp: 'syntax: `!say <text>`',
			name: 'say',
			usage: '<text:...string>'
		});
	}

	/**
	 * Run the "say" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ text: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof SayCommand
	 */
	public async run(msg: KlasaMessage, [...text]): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendMessage(text);
	}
}
