import { stripIndents } from 'common-tags';
import { Guild, Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as moment from 'moment';
import 'moment-duration-format';

interface IDuration extends moment.Duration {
	format: (template?: string, precision?: number, settings?: IDurationSettings) => string;
}

interface IDurationSettings {
	forceLength: boolean;
	precision: number;
	template: string;
	trim: boolean | 'left' | 'right';
}

const { version }: { version: string } = require('../../../package');

export default class StatsCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['statistics'],
			description: 'Displays statistics about the bot.',
			group: 'util',
			guildOnly: true,
			memberName: 'stats',
			name: 'stats',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		const duration: IDuration = moment.duration(this.client.uptime) as IDuration;
		return msg.embed({
			color: 3447003,
			description: '**Spudnik Statistics**',
			fields: [
				{
					inline: true,
					name: '❯ Uptime',
					value: duration.format('d[ days], h[ hours], m[ minutes, and ]s[ seconds]'),
				},
				{
					inline: true,
					name: '❯ Memory usage',
					value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
				},
				{
					inline: true,
					name: '❯ General Stats',
					value: stripIndents`
					• Guilds: ${this.client.guilds.size}
					• Channels: ${this.client.channels.size}
					• Users: ${this.client.guilds.map((guild: Guild) => guild.memberCount).reduce((a: number, b: number): number => a + b)}
					`,
				},
				{
					inline: true,
					name: '❯ Version',
					value: `v${version}`,
				},
			],
			thumbnail: { url: this.client.user.avatarURL },
		});
	}
}
