import chalk from 'chalk';
import { Guild, PresenceData } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { Configuration } from 'src/lib/spudnik';
import * as rp from 'request-promise';

export const handleReady = async(version: string, client: CommandoClient, config: Configuration) => {
	const statuses: PresenceData[] = [
		{
			activity: {
				name: `${client.commandPrefix}help | ${client.guilds.array().length} Servers`,
				type: 'PLAYING'
			}
		},
		{
			activity: {
				name: 'spudnik.io',
				type: 'PLAYING'
			}
		},
		{
			activity: {
				name: `${client.commandPrefix}donate 💕`,
				type: 'PLAYING'
			}
		},
		{
			activity: {
				name: `Version: v${version} | ${client.commandPrefix}help`,
				type: 'PLAYING'
			}
		},
		{
			activity: {
				name: `spudnik.io/support | ${client.commandPrefix}support`,
				type: 'PLAYING'
			}
		},
		{
			activity: {
				name: 'docs.spudnik.io',
				type: 'PLAYING'
			}
		},
		{
			activity: {
				name: `and Assisting ${client.guilds.map((guild: Guild) => guild.memberCount).reduce((a: number, b: number): number => a + b)} users.`,
				type: 'WATCHING'
			}
		},
		{
			activity: {
				name: `and Assisting ${client.guilds.array().length} servers.`,
				type: 'WATCHING'
			}
		},
		{
			activity: {
				name: 'For the Motherland!',
				type: 'PLAYING'
			}
		}
	];

	console.log(chalk.magenta(`Logged into Discord! Serving in ${client.guilds.array().length} Discord servers`));
	console.log(chalk.blue('---Spudnik Launch Success---'));

	// Update bot status, using array of possible statuses
	let statusIndex: number = -1;
	statusIndex = updateStatus(client, statuses, statusIndex);
	setInterval(() => { statusIndex = updateStatus(client, statuses, statusIndex) }, config.statusUpdateInterval, true);
	setInterval(() => { updateBotListStats(config, client) }, config.botListUpdateInterval, true);
}

/**
 * Updates bot status on interval
 */
const updateStatus = (client: CommandoClient, statuses: PresenceData[], statusIndex: number): number => {
	++statusIndex;

	if (statusIndex >= statuses.length) {
		statusIndex = 0;
	}

	client.user.setPresence(statuses[statusIndex]);

	return statusIndex;
}

/**
 * Update bot list stats on interval
 */
const updateBotListStats = (config: Configuration, client: CommandoClient): void => {
	const guildCount = client.guilds.size;

	console.log(`- Bot is serving on ${guildCount} servers.`);
	// DISCORD.BOTS.gg
	if (config.botsggApiKey) {
		rp({
			body: { guildCount: guildCount },
			headers: { Authorization: config.botsggApiKey },
			method: 'POST',
			uri: `https://discord.bots.gg/api/v1/bots/${client.user.id}/stats`
		})
		.then(() => console.log('- Posted statistics successfully', 'discord.bots.gg'))
		.catch(() => console.log('Failed to post statistics', 'discord.bots.gg'))
	}

	// BOTS.ONDISCORD.xyz
	if (config.bodApiKey) {
		rp({
			body: { guildCount: guildCount },
			headers: { Authorization: config.bodApiKey },
			method: 'POST',
			uri: `https://bots.ondiscord.xyz/bot-api/bots/${client.user.id}/guilds`
		})
		.then(() => console.log('- Posted statistics successfully', 'bots.ondiscord.xyz'))
		.catch(() => console.log('Failed to post statistics', 'bots.ondiscord.xyz'))
	}

	// DISCORDBOTS.org
	if (config.dbApiKey) {
		rp({
			body: { server_count: guildCount },
			headers: { Authorization: config.dbApiKey },
			method: 'POST',
			uri: `https://discordbots.org/api/bots/${client.user.id}/stats`
		})
		.then(() => console.log('- Posted statistics successfully', 'discordbots.org'))
		.catch(() => console.log('Failed to post statistics', 'discordbots.org'))
	}

	// BOTSFORDISCORD.com
	if (config.bfdApiKey) {
		rp({
			body: { server_count: guildCount },
			headers: { Authorization: config.bfdApiKey },
			method: 'POST',
			uri: `https://botsfordiscord.com/api/bots/${client.user.id}/stats`
		})
		.then(() => console.log('- Posted statistics successfully', 'botsfordiscord.com'))
		.catch(() => console.log('Failed to post statistics', 'botsfordiscord.com'))
	}

	// DISCORDBOTLIST.com
	if (config.dblApiKey) {
		rp({
			body: { guilds: guildCount, users: client.users.size },
			headers: { Authorization: `Bot ${config.dblApiKey}` },
			method: 'POST',
			uri: `https://discordbotlist.com/api/bots/${client.user.id}/stats`
		})
		.then(() => console.log('- Posted statistics successfully', 'discordbotlist.com'))
		.catch(() => console.log('Failed to post statistics', 'discordbotlist.com'))
	}
}