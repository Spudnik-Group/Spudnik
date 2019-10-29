import chalk from 'chalk';
import { Guild, PresenceData } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { Configuration } from 'src/lib/spudnik';
import axios from 'axios';
import { stripIndents } from 'common-tags';

export const handleReady = async (version: string, client: CommandoClient, config: Configuration) => {
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
				name: `and Assisting ${client.guilds.map((guild: Guild) => guild.memberCount).reduce((a: number, b: number): number => a + b)} users.`,
				type: 'WATCHING'
			}
		},
		{
			activity: {
				name: `${client.commandPrefix}upvote 👍`,
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
				name: `${client.commandPrefix}changelog 📜`
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
		},
		{
			activity: {
				name: '!feedback 😠😍',
				type: 'PLAYING'
			}
		}
	];


	// Update bot status, using array of possible statuses
	let statusIndex: number = -1;
	statusIndex = updateStatus(client, statuses, statusIndex);
	client.setInterval(() => { statusIndex = updateStatus(client, statuses, statusIndex) }, config.statusUpdateInterval);
	client.setInterval(() => updateBotListStats(config, client), config.botListUpdateInterval);
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
	console.log(`- Bot is serving on ${client.guilds.size} servers.`);

	// DISCORD.BOTS.gg
	if (config.botsggApiKey) {
		axios.post(`https://discord.bots.gg/api/v1/bots/${client.user.id}/stats`, { guildCount: Number(client.guilds.size) },
			{
				headers: { Authorization: config.botsggApiKey }
			})
			.then(() => console.log('- Posted statistics successfully: discord.bots.gg'))
			.catch((err) => console.log(stripIndents`- Failed to post statistics: discord.bots.gg
			Error: ${err}
		`))
	}

	// BOTS.ONDISCORD.xyz
	if (config.bodApiKey) {
		axios.post(`https://bots.ondiscord.xyz/bot-api/bots/${client.user.id}/guilds`, { guildCount: Number(client.guilds.size) },
			{
				headers: { Authorization: config.bodApiKey }
			})
			.then(() => console.log('- Posted statistics successfully: bots.ondiscord.xyz'))
			.catch((err) => console.log(stripIndents`- Failed to post statistics: bots.ondiscord.xyz
			Error: ${err}
		`))
	}

	// DISCORDBOTS.org
	if (config.dbApiKey) {
		axios.post(`https://discordbots.org/api/bots/${client.user.id}/stats`, { server_count: Number(client.guilds.size) },
			{
				headers: { Authorization: config.dbApiKey }
			})
			.then(() => console.log('- Posted statistics successfully: discordbots.org'))
			.catch((err) => console.log(stripIndents`- Failed to post statistics: discordbots.org
			Error: ${err}
		`))
	}

	// BOTSFORDISCORD.com
	if (config.bfdApiKey) {
		axios.post(`https://botsfordiscord.com/api/bot/${client.user.id}`, { server_count: Number(client.guilds.size) },
			{
				headers: { Authorization: config.bfdApiKey }
			})
			.then(() => console.log('- Posted statistics successfully: botsfordiscord.com'))
			.catch((err) => console.log(stripIndents`- Failed to post statistics: botsfordiscord.com
			Error: ${err}
		`))
	}

	// DISCORDBOTLIST.com
	if (config.dblApiKey) {
		axios.post(`https://discordbotlist.com/api/bots/${client.user.id}/stats`, { guilds: Number(client.guilds.size), users: Number(client.users.size) },
			{
				headers: { Authorization: `Bot ${config.dblApiKey}` }
			})
			.then(() => console.log('- Posted statistics successfully: discordbotlist.com'))
			.catch((err) => console.log(stripIndents`- Failed to post statistics: discordbotlist.com
			Error: ${err}
		`))
	}
}