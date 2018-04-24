import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';

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
	constructor(client: CommandoClient) {
		super(client, {
			name: 'say',
			group: 'misc',
			memberName: 'say',
			guildOnly: true,
			description: 'Replies with the text you provide.',
			examples: ['say Hi there!'],
			args: [
				{
					key: 'text',
					prompt: 'What text would you like the bot to say?',
					type: 'string',
				},
			],
		});
	}

	/**
	 * Run the "say" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ text: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof SayCommand
	 */
	public async run(msg: CommandMessage, args: { text: string }): Promise<Message | Message[]> {
		msg.delete();
		return msg.say(args.text);
	}
}
