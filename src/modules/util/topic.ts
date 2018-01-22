import { stripIndents } from 'common-tags';
import { Guild, Message, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';

export default class TopicCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Shows the purpose of the chat channel.',
			group: 'util',
			guildOnly: true,
			memberName: 'topic',
			name: 'topic',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		const channel = msg.channel;
		let response = '';
		if (channel instanceof TextChannel) {
			response = channel.topic;
			if (channel.topic.trim() === '') {
				response = "There doesn't seem to be a topic for this channel. Maybe ask the mods?";
			}
			return msg.embed({
				color: 5592405,
				description: response,
				title: channel.name,
				thumbnail: { url: this.client.user.avatarURL },
			});
		}
		return null;
	}
}
