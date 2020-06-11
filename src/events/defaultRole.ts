/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Guild, GuildMember, TextChannel, MessageReaction, User } from 'discord.js';
import { Event, KlasaMessage } from 'klasa';
import { stripIndents } from 'common-tags';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { delay } from '@lib/utils/util';
import { responses } from '@lib/constants/responses';

export default class extends Event {

	public async run(guild: Guild, member: GuildMember): Promise<void> {
		const tosWelcomeEnabled = guild.settings.get(GuildSettings.Tos.Welcome.Enabled);
		const tosWelcomeMessage = guild.settings.get(GuildSettings.Tos.Welcome.Message);
		const tosWelcomeChannel = guild.settings.get(GuildSettings.Tos.Channel);
		const tosRole = guild.settings.get(GuildSettings.Tos.Role);

		if (!member.user.bot && tosWelcomeEnabled && tosWelcomeMessage && tosWelcomeChannel && tosRole) {
			const message = tosWelcomeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}>`);
			const channel = guild.channels.get(tosWelcomeChannel);
			const role = guild.roles.get(tosRole);

			if (channel && role) {
				await delay(2500);

				const messageSent = await (channel as TextChannel).send(message);

				await delay(5000);

				await messageSent.react(responses.reactions.YES);
				await messageSent.react(responses.reactions.NO);

				const filter = (reaction: MessageReaction, user: User): boolean => user.id === member.id;
				const reactions = await messageSent.awaitReactions(filter, { time: 1000 * 60 * 5, max: 1 });

				const roleEmbed = specialEmbed(messageSent as KlasaMessage, specialEmbedTypes.RoleManager);

				if (Boolean(reactions.size) && reactions.firstKey() === responses.reactions.YES) {
					await member.roles.add(role.id);
					await messageSent.delete();

					roleEmbed.setDescription(stripIndents`
						**Member:** ${member.user.tag} (${member.id})
						**Action:** The default (TOS) role of <@&${role.id}> for the guild ${messageSent.guild.name} has been applied.
					`);

					await modLogMessage(messageSent as KlasaMessage, roleEmbed);
				} else if (Boolean(reactions.size) && reactions.firstKey() === responses.reactions.NO) {
					await member.kick('User did not accept TOS.');
					await messageSent.delete();

					roleEmbed.setDescription(stripIndents`
						**Member:** ${messageSent.author.tag} (${messageSent.author.id})
						**Action:** User did not accept TOS.
					`);

					await modLogMessage(messageSent as KlasaMessage, roleEmbed);
				}
			} else {
				this.client.emit('warn', `There was an error trying to welcome a new guild member in ${guild}, the channel/role may no longer exist.`);
			}
		}
	}

}
