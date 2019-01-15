import { Message, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, deleteCommandMessages, stopTyping, startTyping } from '../../lib/helpers';

/**
 * Posts the topic of a channel.
 *
 * @export
 * @class TopicCommand
 * @extends {Command}
 */
export default class TopicCommand extends Command {
	/**
	 * Creates an instance of TopicCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof TopicCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Returns the purpose of the chat channel.',
			examples: ['!topic'],
			group: 'misc',
			guildOnly: true,
			memberName: 'topic',
			name: 'topic',
			throttling: {
				duration: 3,
				usages: 2
			}
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
		const channel = msg.channel as TextChannel;
		let response = channel.topic;

		startTyping(msg);
		
		if (response === null) {
			response = "There doesn't seem to be a topic for this channel. Maybe ask the mods?";
		} else if (response.trim() === '') {
			response = "There doesn't seem to be a topic for this channel. Maybe ask the mods?";
		}
		
		deleteCommandMessages(msg, this.client);
		stopTyping(msg);
		
		// Send the success response
		return msg.embed({
			color: getEmbedColor(msg),
			description: response,
			thumbnail: { url: this.client.user.avatarURL },
			title: channel.name
		});
	}
}
