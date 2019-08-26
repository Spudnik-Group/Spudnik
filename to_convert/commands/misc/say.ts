import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { deleteCommandMessages } from '../../lib/custom-helpers';

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
			args: [
				{
					key: 'text',
					prompt: 'What text would you like me to say?',
					type: 'string'
				}
			],
			description: 'Returns the text provided.',
			details: 'syntax: `!say <text>`',
			examples: ['!say Hi there!'],
			group: 'misc',
			guildOnly: true,
			memberName: 'say',
			name: 'say'
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
	public async run(msg: KlasaMessage, args: { text: string }): Promise<KlasaMessage | KlasaMessage[]> {
		deleteCommandMessages(msg);
		
		return msg.say(args.text);
	}
}
