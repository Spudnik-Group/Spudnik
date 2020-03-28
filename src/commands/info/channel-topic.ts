/**
 * Copyright (c) 2020 Spudnik Group
 */

import { TextChannel } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { baseEmbed } from '@lib/helpers/embed-helpers';

/**
 * Returns the purpose of the specified channel, or the current one.
 *
 * @export
 * @class ChannelTopicCommand
 * @extends {Command}
 */
export default class ChannelTopicCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['ct'],
			description: 'Returns the purpose of the specified channel, or the current one.',
			name: 'topic',
			usage: '[channel:channel]'
		});
	}

	/**
	 * Run the "channel-topic" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ChannelTopicCommand
	 */
	public async run(msg: KlasaMessage, [content = msg.channel]): Promise<KlasaMessage | KlasaMessage[]> {
		const channel = content as TextChannel;

		// Send the success response
		return msg.sendEmbed(
			baseEmbed(msg)
				.setDescription(`Channel Topic: ${(channel.topic === null || channel.topic.trim().length) ? 'There doesn\'t seem to be a topic for this channel. Maybe ask the mods?' : channel.topic}`)
				.setThumbnail(msg.guild.iconURL())
				.setTitle(channel.name)
		);
	}

}
