/**
 * Copyright (c) 2020 Spudnik Group
 */

import { TextChannel } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { baseEmbed } from '@lib/helpers/embed-helpers';

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
		return msg.sendEmbed(baseEmbed(msg)
			.addField('Name', channel.name, true)
			.addField('ID', channel.id, true)
			.addField('Topic', (channel.topic === null || channel.topic.length < 2) ? '-' : channel.topic, false)
			.addField('Created At', channel.createdAt.toUTCString(), true)
			.addField('Users', channel.members.size.toString(), true)
			.setThumbnail(msg.guild.iconURL())
			.setTitle(channel.type === 'text' ? 'Text Channel Info' : 'Voice Channel Info'));
	}

}
