import { stripIndents } from 'common-tags';
import { Guild, Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import * as distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import { deleteCommandMessages } from '../../lib/helpers';

// tslint:disable-next-line:no-var-requires
const { version, dependencies }: { version: string, dependencies: any } = require('../../../package');

/**
 * Post statistics about the bot.
 *
 * @export
 * @class StatsCommand
 * @extends {Command}
 */
export default class StatsCommand extends Command {
	/**
	 * Creates an instance of StatsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof StatsCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['statistics'],
			description: 'Returns statistics about the bot.',
			examples: [
				'!stats',
				'!statistics'
			],
			group: 'util',
			guildOnly: true,
			memberName: 'stats',
			name: 'stats',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "stats" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof StatsCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		let statsEmbed: MessageEmbed = new MessageEmbed()
			.setColor(getEmbedColor(msg))
			.setDescription('**Spudnik Statistics**')
			.addField('❯ Uptime', distanceInWordsToNow(this.client.readyAt, { includeSeconds: true }), true)
			.addField('❯ Process Stats', stripIndents`
						• Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
						• Node Version: ${process.version}
						• Version: v${version}`, true)
			.addField('❯ General Stats', stripIndents`
						• Guilds: ${this.client.guilds.size}
						• Channels: ${this.client.channels.size}
						• Users: ${this.client.guilds.map((guild: Guild) => guild.memberCount).reduce((a: number, b: number): number => a + b)}
						• Commands: ${this.client.registry.commands.size}`, true)
			.addField('❯ Home Server', 'https://spudnik.io/support', true)
			.addField('❯ Source Code', 'https://github.com/Spudnik-Group/Spudnik', true)
			.addField('❯ Dependencies', this.parseDependencies())
			.setThumbnail(`${this.client.user.avatarURL()}`);
		
		deleteCommandMessages(msg, this.client);
		
		return msg.embed(statsEmbed);
	}

	private parseDependencies() {
		return Object.entries(dependencies).map((dep: any) => {
			if (dep[1].startsWith('github:')) {
				const repo = dep[1].replace('github:', '').split('/');
				return `[${dep[0]}](https://github.com/${repo[0]}/${repo[1].replace(/#.+/, '')})`;
			}
			return `[${dep[0]}](https://npmjs.com/${dep[0]})`;
		}).join(', ');
	}
}
