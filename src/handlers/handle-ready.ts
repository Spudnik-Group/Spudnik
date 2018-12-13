import chalk from 'chalk';
import { Guild, PresenceData } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { Configuration } from 'src/lib/spudnik';

export function handleReady(version: string, client: CommandoClient, config: Configuration) {
	const users: number = client.guilds.map((guild: Guild) => guild.memberCount).reduce((a: number, b: number): number => a + b);
	const guilds: number = client.guilds.array().length;
	const statuses: PresenceData[] = [
		{
			activity: {
				name: `${client.commandPrefix}help | ${guilds} Servers`,
				type: 'PLAYING'
			}
		},
		{
			activity: {
				name: 'spudnik.io',
				type: 'STREAMING'
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
				type: 'STREAMING'
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
				type: 'STREAMING'
			}
		},
		{
			activity: {
				name: `and Assisting ${users} users on ${guilds} servers`,
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

	console.log(chalk.magenta(`Logged into Discord! Serving in ${guilds} Discord servers`));
	console.log(chalk.blue('---Spudnik Launch Success---'));

	// Update bot status, using array of possible statuses
	let statusIndex: number = -1;
	statusIndex = updateStatus(client, statuses, statusIndex);
	setInterval(() => statusIndex = updateStatus(client, statuses, statusIndex), config.statusUpdateInterval, true);
	setInterval(() => updateStatusStats(config, client, statuses), config.botListUpdateInterval, true);
}

/**
 * Updates discord bot list stats and status messages on interval
 */
const updateStatusStats = (config: Configuration, client: CommandoClient, statuses: PresenceData[]): PresenceData[] => {
	const users: number = client.guilds.map((guild: Guild) => guild.memberCount).reduce((a: number, b: number): number => a + b);
	const guilds: number = client.guilds.array().length;

	// Update Statuses
	statuses = statuses.filter((item: PresenceData) => {
		if (item.activity && item.activity.type !== 'WATCHING') {
			return true;
		}
		return false;
	});

	statuses.push({
		activity: {
			name: `and Assisting ${users} users on ${guilds} servers`,
			type: 'WATCHING'
		}
	});

	return statuses;
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