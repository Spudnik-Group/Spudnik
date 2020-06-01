/**
 * Copyright (c) 2020 Spudnik Group
 */

import { KlasaMessage, Command, CommandStore } from 'klasa';
import { getEmbedColor } from '@lib/helpers/custom-helpers';
import { loadavg, uptime } from 'os';
import { Guild } from 'discord.js';

/**
 * Returns statistics about the bot.
 *
 * @export
 * @class StatsCommand
 * @extends {Command}
 */
export default class StatsCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['statistics'],
			description: 'Returns statistics about the bot.'
		});
	}

	/**
	 * Run the "stats" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof StatsCommand
	 */
	public run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendLocale('COMMAND_STATS', [getEmbedColor(msg), this.generalStatistics, this.uptimeStatistics, this.usageStatistics]);
	}

	private get generalStatistics(): StatsGeneral {
		return {
			CHANNELS: this.client.channels.size.toLocaleString(),
			GUILDS: this.client.guilds.size.toLocaleString(),
			NODE_JS: process.version,
			USERS: this.client.guilds.reduce((a: number, b: Guild) => a + b.memberCount, 0).toLocaleString(),
			VERSION: `v${process.env.npm_package_version}`
		};
	}

	private get uptimeStatistics(): StatsUptime {
		return {
			CLIENT: this.client.uptime!,
			HOST: uptime() * 1000,
			TOTAL: process.uptime() * 1000
		};
	}

	private get usageStatistics(): StatsUsage {
		const usage = process.memoryUsage();
		return {
			CPU_LOAD: loadavg().map((load: number) => Math.round(load * 10000) / 100) as [number, number, number],
			RAM_TOTAL: `${Math.round(100 * (usage.heapTotal / 1048576)) / 100}MB`,
			RAM_USED: `${Math.round(100 * (usage.heapUsed / 1048576)) / 100}MB`
		};
	}

}

export interface StatsGeneral {
	CHANNELS: string;
	GUILDS: string;
	NODE_JS: string;
	USERS: string;
	VERSION: string;
}

export interface StatsUptime {
	CLIENT: number;
	HOST: number;
	TOTAL: number;
}

export interface StatsUsage {
	CPU_LOAD: [number, number, number];
	RAM_TOTAL: string;
	RAM_USED: string;
}
