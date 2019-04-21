import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
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
	constructor(client: CommandoClient) {
		super(client, {
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
	 * @param {CommandoMessage} msg
	 * @param {{ text: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof SayCommand
	 */
	public async run(msg: CommandoMessage, args: { text: string }): Promise<Message | Message[]> {
		deleteCommandMessages(msg);
		
		return msg.say(args.text);
	}
}
