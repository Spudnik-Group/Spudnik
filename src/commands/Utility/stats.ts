import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Command, KlasaClient, CommandStore } from 'klasa';
import * as distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import { getEmbedColor } from '../../helpers/custom-helpers';

const { version, dependencies } = require('../../../package');

/**
 * Returns statistics about the bot.
 *
 * @export
 * @class StatsCommand
 * @extends {Command}
 */
export default class extends Command {
	/**
	 * Creates an instance of StatsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof StatsCommand
	 */
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
	async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		let statsEmbed = new MessageEmbed()
			.setColor(getEmbedColor(msg))
			.setDescription('**Spudnik Statistics**')
			.addField('❯ Uptime', distanceInWordsToNow(<Date>this.client.readyAt, { includeSeconds: true }), true)
			.addField('❯ Process Stats', stripIndents`
						• Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
						• Node Version: ${process.version}
						• Version: v${version}`, true)
			.addField('❯ General Stats', stripIndents`
						• Guilds: ${this.client.guilds.size}
						• Channels: ${this.client.channels.size}
						• Users: ${this.client.guilds.map((guild) => guild.memberCount)
							.reduce((a, b) => a + b)}
						• Commands: ${this.client.commands.size}`, true)
			.addField('❯ Spudnik Command', '[Join](https://spudnik.io/support)', true)
			.addField('❯ Source Code', '[View](https://github.com/Spudnik-Group/Spudnik)', true)
			.addField('❯ Invite to Your Server!', '[Invite](https://spudnik.io/invite)', true)
			.addField('❯ Dependencies', this.parseDependencies())
			.setThumbnail(`${this.client.user ? this.client.user.avatarURL() : ''}`);
		
		return msg.sendEmbed(statsEmbed);
	}

	parseDependencies() {
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
