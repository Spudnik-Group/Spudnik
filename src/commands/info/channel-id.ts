/**
 * Copyright (c) 2020 Spudnik Group
 */

import { TextChannel, Channel } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { baseEmbed } from '@lib/helpers/embed-helpers';

/**
 * Returns the id of the specified channel, or the current one.
 *
 * @export
 * @class ChannelIDCommand
 * @extends {Command}
 */
export default class ChannelIDCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['cid', 'channelid', 'channelID'],
			description: 'Returns the id of the specified channel, or the current one.',
			usage: '(channel:optional-channel)'
		});
	}

	/**
	 * Run the "channel-id" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ChannelIDCommand
	 */
	public run(msg: KlasaMessage, [content = msg.channel]: [Channel]): Promise<KlasaMessage | KlasaMessage[]> {
		const channel = content as TextChannel;

		// Send the success response
		return msg.sendEmbed(
			baseEmbed(msg)
				.setDescription(`Channel ID: ${channel.id}`)
				.setThumbnail(msg.guild.iconURL())
				.setTitle(channel.guild.name)
		);
	}

}
