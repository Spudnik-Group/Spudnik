import { Message, TextChannel } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import { stopTyping, startTyping } from '../../lib/helpers';

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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Returns the purpose of the chat channel.',
			examples: ['!topic'],
			group: 'info',
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
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof TopicCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const channel = msg.channel as TextChannel;
		let response = channel.topic;

		startTyping(msg);
		
		if (response === null) {
			response = "There doesn't seem to be a topic for this channel. Maybe ask the mods?";
		} else if (response.trim() === '') {
			response = "There doesn't seem to be a topic for this channel. Maybe ask the mods?";
		}
		
		deleteCommandMessages(msg);
		stopTyping(msg);
		
		// Send the success response
		return msg.embed({
			color: getEmbedColor(msg),
			description: `Channel Topic: ${response}`,
			thumbnail: { url: msg.guild.iconURL() },
			title: channel.name
		});
	}
}
