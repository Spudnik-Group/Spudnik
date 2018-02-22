import { Message, GuildMemberResolvable, User, UserResolvable } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { resolveMention, sendSimpleEmbeddedImage } from '../../lib/helpers';

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
					type: 'user',
				},
			],
		});
	}

	public async run(msg: CommandMessage, args: { mention: UserResolvable }): Promise<Message | Message[]> {
		if (args.mention && args.mention !== null) {
			return msg.reply(msg, {
				reply: args.mention,
				embed: { image: { url: 'http://i.imgur.com/NqpPXHu.jpg' } },
			});
		}
		return sendSimpleEmbeddedImage(msg, 'http://i.imgur.com/NqpPXHu.jpg');
	}
}
