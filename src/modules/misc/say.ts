import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';

export default class SayCommand extends Command {
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

	public async run(msg: CommandMessage, args: { text: string }): Promise<Message | Message[]> {
		msg.delete();
		return msg.say(args.text);
	}
}
