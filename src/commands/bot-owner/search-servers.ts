/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed, Guild, User } from 'discord.js';
import { stripIndents } from 'common-tags';
import { Command, CommandStore, KlasaMessage, RichDisplay, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { baseEmbed } from '@lib/helpers/embed-helpers';

/**
 * Search for a server the bot is in.
 *
 * @export
 * @class SearchServersCommand
 * @extends {Command}
 */
export default class SearchServersCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['ss', 'searchservers'],
			description: 'Search for a server the bot is in.',
			guarded: true,
			hidden: true,
			permissionLevel: 9, // BOT OWNER
			usage: '<serverName:string{2}>'
		});
	}

	/**
	 * Run the "SearchServersCommand" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof SearchServersCommand
	 */
	public async run(msg: KlasaMessage, [serverName]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const guilds = Array.from(this.client.guilds.values()).filter((guild: Guild) => guild.name.includes(serverName));
		const totalGuilds = guilds.length;
		const display = new RichDisplay(baseEmbed(msg)
			.setTitle('Server Search')
			.setDescription(`Found ${totalGuilds} servers${this.client.shard ? `, in Shard ${this.client.shard.ids}` : ''} containing **${serverName}**.`));
		const noOfPages = Math.ceil(totalGuilds / 5);

		for (let i = 0; i < noOfPages; i++) {
			const currentPage = guilds.slice(i * 5, (i * 5) + 5);
			display.addPage((template: MessageEmbed) => {
				currentPage.forEach(async (guild: Guild) => {
					template.addField(
						guild.name,
						stripIndents`
							**ID**: ${guild.id}
							**User Count**: ${guild.memberCount}
							**Channel Count**: ${guild.channels.size}
							**Bot Invited**: ${new Timestamp('MMMM d YYYY [at] HH:mm').display(guild.joinedTimestamp)}
							**Owner**: ${guild.owner.user.tag} (${guild.ownerID})
							**Region**: ${guild.region}
							**Prefix**: ${await guild.settings.get(GuildSettings.Prefix) ? await guild.settings.get(GuildSettings.Prefix) : '!'}
							--
						`
					);
				});

				return template;
			});
		}

		await display.run(await msg.send('Loading server list...'), { filter: (_reaction: any, user: User) => user === msg.author });

		return null;
	}

}
