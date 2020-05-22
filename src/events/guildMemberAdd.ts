/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event, KlasaMessage } from 'klasa';
import { SpudConfig } from '@lib//config/spud-config';
import { TextChannel, GuildMember, Permissions } from 'discord.js';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { delay } from '@lib/utils/util';
import { stripIndents } from 'common-tags';

export default class extends Event {

	public async run(member: GuildMember): Promise<void> {
		const { guild } = member;

		if (SpudConfig.botListGuilds.includes(guild.id)) return; // Guild is on Blacklist, ignore.

		const welcomeEnabled = guild.settings.get(GuildSettings.Welcome.Enabled);
		const welcomeMessage = guild.settings.get(GuildSettings.Welcome.Message);
		const welcomeChannel = guild.settings.get(GuildSettings.Welcome.Channel);

		const tosWelcomeEnabled = guild.settings.get(GuildSettings.Tos.Welcome.Enabled);
		const tosWelcomeMessage = guild.settings.get(GuildSettings.Tos.Welcome.Message);
		const tosWelcomeChannel = guild.settings.get(GuildSettings.Tos.Channel);
		const tosRole = guild.settings.get(GuildSettings.Tos.Role);

		if (welcomeEnabled && welcomeMessage && welcomeChannel) {
			const message = welcomeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}>`);
			const channel = guild.channels.get(welcomeChannel);

			if (channel) {
				await (channel as TextChannel).send(message);
			} else {
				this.client.emit('warn', `There was an error trying to welcome a new guild member in ${guild}, the channel may no longer exist.`);
			}
		}

		if (!Boolean(member.user.bot) && tosWelcomeEnabled && tosWelcomeMessage && tosWelcomeChannel && tosRole) {
			const message = tosWelcomeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}>`);
			const channel = guild.channels.get(tosWelcomeChannel);
			const role = guild.roles.get(tosRole);

			if (channel && role) {
				const messageSent = await (channel as TextChannel).send(message);

				const REACTIONS = { YES: '✅', NO: '❎' };

				await delay(5000);

				await messageSent.react(REACTIONS.YES);
				await messageSent.react(REACTIONS.NO);

				// eslint-disable-next-line @typescript-eslint/typedef
				const reactions = await messageSent.awaitReactions((__, user) => user.id === member.id, { time: 1000 * 60 * 5, max: 1 });

				// Remove all reactions if the user has permissions to do so
				if (messageSent.guild && (messageSent.channel as TextChannel).permissionsFor(messageSent.guild.me!)!.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
					messageSent.reactions.removeAll().catch((err: any) => this.client.emit('warn', `There was an error trying to remove all reactions from a message; ${err}`));
				}

				const roleEmbed = specialEmbed(messageSent as KlasaMessage, specialEmbedTypes.RoleManager);

				if (Boolean(reactions.size) && reactions.firstKey() === REACTIONS.YES) {
					try {
						await member.roles.add(role.id);
						await messageSent.delete();
					} catch (err) {
						await (channel as TextChannel).send(`erm... ${err}`);
					}

					roleEmbed.setDescription(stripIndents`
						**Member:** ${member.user.tag} (${member.id})
						**Action:** The default (TOS) role of <@&${role.id}> for the guild ${messageSent.guild.name} has been applied.
					`);

					await modLogMessage(messageSent as KlasaMessage, roleEmbed);
				} else if (Boolean(reactions.size) && reactions.firstKey() === REACTIONS.NO) {
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
