/**
 * Copyright (c) 2020 Spudnik Group
 */

import { TextChannel, MessageEmbed } from 'discord.js';
import { getEmbedColor } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Returns info on the specified channel, or the current one.
 *
 * @export
 * @class ChannelIDCommand
 * @extends {Command}
 */
export default class ChannelIDCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['cinfo'],
			description: 'Returns info on the specified channel, or the current one.',
			name: 'channelInfo',
			usage: '[channel:channel]'
		});
	}

	/**
	 * Run the "channel-info" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ChannelIDCommand
	 */
	public async run(msg: KlasaMessage, [content = msg.channel]): Promise<KlasaMessage | KlasaMessage[]> {
		const channel = content as TextChannel;

		// Send the success response
		return msg.sendEmbed(new MessageEmbed({
			color: getEmbedColor(msg),
			fields: [
				{
					name: 'Name',
					value: channel.name,
					inline: true
				},
				{
					name: 'ID',
					value: channel.id,
					inline: true
				},
				{
					name: 'Topic',
					value: (channel.topic === null || channel.topic.length < 2) ? '-' : channel.topic,
					inline: false
				},
				{
					name: 'Created At',
					value: channel.createdAt.toUTCString(),
					inline: true
				},
				{
					name: 'Users',
					value: channel.members.size.toString(),
					inline: true
				}
			],
			thumbnail: { url: msg.guild.iconURL() },
			title: channel.type === 'text' ? 'Text Channel Info' : 'Voice Channel Info'
		}));
	}

}
