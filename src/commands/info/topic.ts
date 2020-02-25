/**
 * Copyright (c) 2020 Spudnik Group
 */

import { TextChannel, MessageEmbed } from 'discord.js';
import { getEmbedColor } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Posts the topic of a channel.
 *
 * @export
 * @class TopicCommand
 * @extends {Command}
 */
export default class TopicCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns the purpose of the chat channel.',
			name: 'topic'
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

		if (response === null) {
			response = "There doesn't seem to be a topic for this channel. Maybe ask the mods?";
		} else if (response.trim() === '') {
			response = "There doesn't seem to be a topic for this channel. Maybe ask the mods?";
		}

		// Send the success response
		return msg.sendEmbed(new MessageEmbed({
			color: getEmbedColor(msg),
			description: `Channel Topic: ${response}`,
			thumbnail: { url: msg.guild.iconURL() },
			title: channel.name
		}));
	}

}
