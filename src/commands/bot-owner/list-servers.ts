/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed, Guild, User } from 'discord.js';
import { stripIndents } from 'common-tags';
import { Command, CommandStore, KlasaMessage, RichDisplay, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { baseEmbed } from '@lib/helpers/embed-helpers';

/**
 * Returns a list of servers the bot is in.
 *
 * @export
 * @class ListServersCommand
 * @extends {Command}
 */
export default class ListServersCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['ls', 'list-servers'],
			description: 'Returns a list of servers the bot is in.',
			guarded: true,
			hidden: true,
			permissionLevel: 9 // BOT OWNER
		});
	}

	/**
	 * Run the "ListServersCommand" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ListServersCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		let guilds = Array.from(this.client.guilds.values());
		const totalGuilds = guilds.length;
		const display = new RichDisplay(baseEmbed(msg)
			.setTitle('Server List')
			.setDescription(`Spudnik is connected to **${totalGuilds}** servers${this.client.shard ? `, in Shard ${this.client.shard.ids}` : ''}.`));
		const noOfPages = Math.ceil(totalGuilds / 5);

		for (let i = 0; i < noOfPages; i++) {
			guilds = guilds.slice(i * 5, (i * 5) + 5);
			display.addPage((template: MessageEmbed) => {
				guilds.forEach(async (guild: Guild) => {
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
