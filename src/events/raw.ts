import { Event } from 'klasa';
import { TextChannel, Message, GuildChannel, MessageEmbed, Guild } from 'discord.js';
import { SpudConfig } from '../lib/config/spud-config';

export default class extends Event {

	async run(event, ...args) {
		if (!event.d || !event.d.guild_id) { return; } //Ignore non-guild events
		if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(event.t)) { return; } //Ignore non-emoji related actions
		
		const { d: data } = event;
		const guild: Guild = await this.client.guilds.get(data.guild_id);
		const channel: GuildChannel = await guild.channels.get(data.channel_id);

		if (SpudConfig.botListGuilds.includes(guild.id)) { return; } //Guild is on Blacklist, ignore.
		if ((channel as TextChannel).nsfw) { return; } //Ignore NSFW channels
		if (!(channel as TextChannel).permissionsFor(this.client.user.id).has('READ_MESSAGE_HISTORY')) { return; } //Bot doesn't have the right permissions to retrieve the message

		const message: Message = await (channel as TextChannel).messages.fetch(data.message_id);
		const starboardEnabled: boolean = await guild.settings.get('starboard.enabled');
		
		if (message.author.id === data.user_id) { return; } // You can't star your own messages
		if (message.author.bot) { return; } // You can't star bot messages
		if (!starboardEnabled) { return; } //Ignore if starboard isn't set up

		const currentEmojiKey: any = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
		const starboardTrigger: string = await guild.settings.get('starboard.trigger');

		// Check for starboard reaction
		if (starboardTrigger === currentEmojiKey) {
			const starboardChannel = await guild.settings.get('starboard.channel');
			const starboard: GuildChannel = await guild.channels.get(starboardChannel);

			if (!starboard || !starboardChannel) { return; } //Ignore if starboard isn't set up
			if (starboard === channel) { return; } //Can't star items in starboard channel
			if (!starboard.permissionsFor(this.client.user.id).has('SEND_MESSAGES') ||
				!starboard.permissionsFor(this.client.user.id).has('EMBED_LINKS') ||
				!starboard.permissionsFor(this.client.user.id).has('ATTACH_FILES')) {
				//Bot doesn't have the right permissions in the starboard channel
				// TODO: add a modlog error message here, this shouldn't silently fail
				return;
			}

			const reaction: any = message.reactions.get(currentEmojiKey);
			const starboardMessages = await (starboard as TextChannel).messages.fetch({ limit: 100 });
			const existingStar = starboardMessages.find(m => {
				// Need this filter if there are non-starboard posts in the starboard channel.
				if (m.embeds.length > 0) {
					if (m.embeds[0].footer) {
						// Find the previously-starred message
						return m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(message.id);
					}
				}
			});
			// If all of the starboard trigger emojis were removed from this message
			if (!reaction) {
				// Check if message is in the starboard
				if (existingStar) {
					// And remove it
					existingStar.delete();

					return;
				}

				return;
			} else {
				const stars = reaction.count;
				const starboardEmbed: MessageEmbed = new MessageEmbed()
					.setAuthor(message.guild.name, message.guild.iconURL())
					.setThumbnail(message.author.displayAvatarURL())
					.addField('Author', message.author.toString(), true)
					.addField('Channel', (channel as TextChannel).toString(), true)
					.addField('Jump', `[Link](${message.url})`, true)
					.setColor(await guild.settings.get('embedColor'))
					.setTimestamp(message.createdTimestamp)
					.setFooter(`⭐ ${stars} | ${message.id} `);

				if (message.content.length > 1) { starboardEmbed.addField('Message', message.content); } // Add message
				if (message.attachments.size > 0) {
					starboardEmbed.setImage((message.attachments as any).first().attachment); // Add attachments
				}

				// Check for presence of post in starboard channel
				if (existingStar) {
					// Old star, update star count
					existingStar.edit({ embed: starboardEmbed })
						.catch((err) => {
							this.client.emit('warn', `Failed to edit starboard embed. Message ID: ${message.id}\nError: ${err}`);

							return;
						});
				} else {
					// Fresh star, add to starboard
					(starboard as TextChannel).send({ embed: starboardEmbed })
						.catch((err) => {
							this.client.emit('warn', `Failed to send new starboard embed. Message ID: ${message.id}\nError: ${err}`);

							return;
						});
				}

			}
		}
	}
}