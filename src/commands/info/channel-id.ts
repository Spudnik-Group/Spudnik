/**
 * Copyright (c) 2020 Spudnik Group
 */

import { TextChannel, MessageEmbed } from 'discord.js';
import { getEmbedColor } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';

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
			aliases: ['cid'],
			description: 'Returns the id of the specified channel, or the current one.',
			name: 'channelID',
			usage: '[channel:channel]'
		});
	}

	/**
	 * Run the "channel-id" command.
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
			description: `Channel ID: ${channel.id}`,
			thumbnail: { url: msg.guild.iconURL() },
			title: channel.guild.name
		}));
	}

}
