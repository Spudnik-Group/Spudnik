/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';
import { TextChannel, Message, GuildChannel, Guild, MessageEmbed } from 'discord.js';
import { SpudConfig } from '@lib//config/spud-config';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

export default class extends Event {

	public async run(event: any): Promise<void> {
		if (!event.guild_id) return; // Ignore non-guild events

		const guild: Guild = this.client.guilds.get(event.guild_id);
		if (SpudConfig.botListGuilds.includes(guild.id)) return; // Guild is on Blacklist, ignore.

		const starboardEnabled: boolean = guild.settings.get(GuildSettings.Starboard.Enabled);
		const starboardChannel = guild.settings.get(GuildSettings.Starboard.Channel);
		const starboard: GuildChannel = guild.channels.get(starboardChannel);
		if (!starboardEnabled || !starboard || !starboardChannel) return; // Ignore if starboard isn't set up

		const channel: GuildChannel = guild.channels.get(event.channel_id);
		if ((channel as TextChannel).nsfw) return; // Ignore NSFW channels
		if (starboard === channel) return; // Can't star items in starboard channel

		const message: Message = await (channel as TextChannel).messages.fetch(event.message_id, false);
		if (message.author.id === event.user_id) return; // You can't star your own messages
		if (message.author.bot) return; // You can't star bot messages

		const currentEmojiKey: any = (event.emoji.id) ? `${event.emoji.name}:${event.emoji.id}` : event.emoji.name;
		const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
		if (!currentEmojiKey.match(emojiRegex)) return; // We don't support any emojis outside of the normal unicode ones
		const starboardTrigger: string = guild.settings.get(GuildSettings.Starboard.Trigger);

		// Check for star board reaction
		if (starboardTrigger === currentEmojiKey) {
			const reactions = message.reactions.get(currentEmojiKey);
			const starboardMessages = await (starboard as TextChannel).messages.fetch({ limit: 100 }, false);
			// eslint-disable-next-line array-callback-return
			const existingStar = starboardMessages.find((m: Message): boolean => {
				// Need this filter if there are non-star board posts in the starboard channel.
				if (m.embeds.length > 0) {
					if (m.embeds[0].footer) {
						// Find the previously-starred message
						return m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(message.id);
					}
				}
			});
			// Check if message is in the star board
			if (existingStar) {
				// Check if there are still star board trigger emojis on the message
				if (reactions) {
					const starboardEmbed: MessageEmbed = new MessageEmbed()
						.setAuthor(message.guild.name, message.guild.iconURL())
						.setThumbnail(message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
						.addField('Author', message.author.toString(), true)
						.addField('Channel', (channel as TextChannel).toString(), true)
						.addField('Jump', `[Link](${message.url})`, true)
						.setColor(guild.settings.get(GuildSettings.EmbedColor))
						.setTimestamp(message.createdTimestamp)
						.setFooter(`⭐ ${reactions.count} | ${message.id} `);

					if (message.content.length > 1) starboardEmbed.addField('Message', message.content); // Add message
					// TODO: fix this? forcing type casting as any seems really shitty
					if (message.attachments.size > 0) starboardEmbed.setImage((message.attachments as any).first().attachment); // Add attachments

					existingStar.edit({ embed: starboardEmbed })
						.catch((err: Error) => {
							this.client.emit('warn', `Failed to edit starboard embed. Message ID: ${message.id}\nError: ${err}`);
						});
				} else {
					// If not, remove it from the star board
					await existingStar.delete();
				}
			}
		}
	}

}
