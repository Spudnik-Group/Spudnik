import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getRandomInt } from '../../lib/helpers';

export default class ChooseCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Have the bot choose for you.',
			group: 'random',
			guildOnly: true,
			memberName: 'choose',
			name: 'choose',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'choice1',
					prompt: 'What is the first option?',
					type: 'string',
				},
				{
					key: 'choice2',
					prompt: 'What is the second option?',
					type: 'string',
				},
			],
		});
	}

	public async run(msg: CommandMessage, args: { choice1: string, choice2: string }): Promise<Message | Message[]> {
		const options: string[] = [args.choice1, args.choice2];
		return msg.embed({
			author: {
				icon_url: msg.guild.me.user.displayAvatarURL,
				name: `${msg.guild.me.user.username}`,
			},
			color: 5592405,
			title: ':thinking:',
			description: `I choose ${options[getRandomInt(0, 1)]}`,
		});
	}
}
