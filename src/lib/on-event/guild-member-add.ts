import chalk from 'chalk';
import { Guild, GuildMember, TextChannel } from 'discord.js';
import { Spudnik } from '../../spudnik';
import { AntiraidSettings } from '../antiraid-settings';

module.exports = (Spudnik: Spudnik) => {
	Spudnik.Discord.on('guildMemberAdd', (member: GuildMember) => {
		const guild = member.guild;
		const guildId = guild.id;

		if (!guild) {
			console.log(chalk.red(`A member joined a guild Spudnik is not a part of ('id': ${guildId})`));
		}

		// Add the server to the list of watched guild
		let antiraidSettings = Spudnik.Config.antiraid[guildId];
		if (!antiraidSettings) {
			Spudnik.Config.antiraid[guildId] = new AntiraidSettings(guild, { channelId: guild.defaultChannel.id, limit: 10, seconds: 10 });
			// TODO: add to db
			antiraidSettings = Spudnik.Config.antiraid[guildId];
		}

		// Get the settings for the server
		const guildSettings = antiraidSettings.settings;
		const seconds = guildSettings.seconds;
		const limit = guildSettings.limit;
		const channel = guild.channels.find('id', guildSettings.channelId) as TextChannel;

		// Determine if the antiraid needs to be disabled.
		const resetJoinCount = antiraidSettings.recentMembers.length && member.joinedTimestamp - antiraidSettings.recentMembers[antiraidSettings.recentMembers.length - 1].joinedTimestamp > seconds * 1000;

		if (limit && antiraidSettings.recentMembers.length >= limit && !resetJoinCount) {
			// If we haven't started kicking, do so now.
			if (!antiraidSettings.kicking) {
				if (channel) {
					channel.send('Antiraid measures have been activated.');
				}

				antiraidSettings.recentMembers.forEach((recentMember: GuildMember) => {
					recentMember.kick('Antiraid protection').then(() => {
						if (channel) {
							channel.send(`${recentMember.user.username}#${recentMember.user.discriminator} was kicked due to antiraid protection.`);
						}
					});
				});

				antiraidSettings.kicking = true;
			}

			// To prevent the array from getting too long, remove the first member and add
			// The last so we only show the people who caused the last threshold to be hit.
			antiraidSettings.recentMembers.shift();
			antiraidSettings.recentMembers.push(member);
			member.kick('Antiraid protection').then(() => {
				if (channel) {
					channel.send(`${member.user.username}#${member.user.discriminator} was kicked due to antiraid protection.`);
				}
			});

			return;
		}

		// Remove all users that are outside the protection timeframe.
		if (resetJoinCount) {
			if (antiraidSettings.kicking && channel) {
				channel.send('Antiraid measures have been deactivated.');
			}

			antiraidSettings.recentMembers = [];
			antiraidSettings.kicking = false;
		}

		// Add the user to recent users
		antiraidSettings.recentMembers.push(member);

		// Add default role to new user
		if (Spudnik.Config.roles && (Object.keys(Spudnik.Config.roles).indexOf(guild.id) > -1) && Spudnik.Config.roles[guild.id].default) {
			const role = guild.roles.filter((x) => x.id === Spudnik.Config.roles[guild.id].default).first();

			if (role) {
				console.log(chalk.blue(`Added default role ${role.name}:${role.id} to ${member.nickname}:${member.id} on ${guild.name}:${guild.id}`));
				member.addRole(role);
			} else {
				console.log(chalk.red(`Default role for ${guild.name}:${guild.id} is not configured properly.`));
			}
		}

		// Welcome new user
		if (Spudnik.Config.welcomeMessages && Spudnik.Config.welcomeMessages[guild.id]) {
			const message = Spudnik.Config.welcomeMessages[guild.id].replace('{guild}', guild.name).replace('{user}', member.displayName);

			member.send(message);
		}
	});
};
