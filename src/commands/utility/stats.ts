/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Command, KlasaClient, CommandStore, Duration } from 'klasa';
import { getEmbedColor } from '../../lib/helpers';

const { version, dependencies } = require('../../../package');

/**
 * Returns statistics about the bot.
 *
 * @export
 * @class StatsCommand
 * @extends {Command}
 */
export default class StatsCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['statistics'],
			description: 'Returns statistics about the bot.',
			name: 'stats'
		});
	}

	/**
	 * Run the "stats" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof StatsCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		let statsEmbed = new MessageEmbed()
			.setColor(getEmbedColor(msg))
			.setDescription('**Spudnik Statistics**')
			.addField('❯ Uptime', Duration.toNow(Date.now() - (process.uptime() * 1000)), true)
			.addField('❯ Process Stats', stripIndents`
						• Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
						• Node Version: ${process.version}
						• Version: v${version}`, true)
			.addField('❯ General Stats', stripIndents`
						• Guilds: ${this.client.guilds.size}
						• Channels: ${this.client.channels.size}
						• Users: ${this.client.guilds.map((guild) => guild.memberCount).reduce((a, b) => a + b)}
						• Commands: ${this.client.commands.size}`, true)
			.addField('❯ Spudnik Command', '[Join](https://spudnik.io/support)', true)
			.addField('❯ Source Code', '[View](https://github.com/Spudnik-Group/Spudnik)', true)
			.addField('❯ Invite to Your Server!', '[Invite](https://spudnik.io/invite)', true)
			.addField('❯ Dependencies', this.parseDependencies())
			.setThumbnail(`${this.client.user ? this.client.user.avatarURL() : ''}`);

		return msg.sendEmbed(statsEmbed);
	}

	private parseDependencies(): string {
		return Object.entries(dependencies)
			.map((dep: any) => {
				if (dep[1].startsWith('github:')) {
					const repo = dep[1].replace('github:', '').split('/');

					return `[${dep[0]}](https://github.com/${repo[0]}/${repo[1].replace(/#.+/, '')})`;
				}

				return `[${dep[0]}](https://npmjs.com/${dep[0]})`;
			})
			.join(', ');
	}
}
