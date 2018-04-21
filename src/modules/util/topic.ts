import { Message, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

/**
 * Posts the topic of a channel.
 * 
 * @export
 * @class TopicCommand
 * @extends {Command}
 */
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

	/**
	 * Run the "topic" command.
	 * 
	 * @param {CommandMessage} msg 
	 * @returns {(Promise<Message | Message[]>)} 
	 * @memberof TopicCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		const channel = msg.channel;
		let response = '';
		if (channel instanceof TextChannel) {
			response = channel.topic;
			if (response === null) {
				response = "There doesn't seem to be a topic for this channel. Maybe ask the mods?";
			} else if (response.trim() === '') {
				response = "There doesn't seem to be a topic for this channel. Maybe ask the mods?";
			}
			return msg.embed({
				color: 5592405,
				description: response,
				title: channel.name,
				thumbnail: { url: this.client.user.avatarURL },
			});
		}
		return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?');
	}
}
