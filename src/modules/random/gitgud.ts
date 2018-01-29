import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { resolveMention } from '../../lib/helpers';

export default class GitGudCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Blesses you with a random bacon gif.',
			group: 'random',
			guildOnly: true,
			memberName: 'gitgud',
			name: 'gitgud',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					default: '',
					key: 'mention',
					prompt: 'Who should gitgud?',
					type: 'string',
				},
			],
		});
	}

	public async run(msg: CommandMessage, args: { mention: string }): Promise<Message | Message[]> {
		return msg.say(msg, {
			reply: resolveMention(args.mention),
			embed: { image: { url: 'http://i.imgur.com/NqpPXHu.jpg' } },
		});
	}
}
