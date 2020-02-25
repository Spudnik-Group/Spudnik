/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { getEmbedColor } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage, RichDisplay, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

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
			aliases: ['ls'],
			description: 'Returns a list of servers the bot is in.',
			guarded: true,
			hidden: true,
			name: 'list-servers',
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
		const display = new RichDisplay(new MessageEmbed()
			.setColor(getEmbedColor(msg))
			.setTitle('Server List')
			.setDescription(`Spudnik is connected to **${totalGuilds}** servers${this.client.shard ? `, in Shard ${this.client.shard.ids}` : ''}.`));
		const noOfPages = Math.ceil(totalGuilds / 5);

		for (let i = 0; i < noOfPages; i++) {
			guilds = guilds.slice(i * 5, (i * 5) + 5);
			display.addPage((template: MessageEmbed) => {
				guilds.forEach(guild => {
					template.fields.push({
						name: guild.name,
						value: stripIndents`
							**ID**: ${guild.id}
							**User Count**: ${guild.memberCount}
							**Channel Count**: ${guild.channels.size}
							**Bot Invited**: ${new Timestamp('MMMM d YYYY [at] HH:mm').display(guild.joinedTimestamp)}
							**Owner**: ${guild.owner.user.tag} (${guild.ownerID})
							**Region**: ${guild.region}
							**Prefix**: ${msg.guildSettings.get(GuildSettings.Prefix) ? msg.guildSettings.get(GuildSettings.Prefix) : '!'}
		
							--
						`
					});
				});

				return template;
			});
		}

		await display.run(await msg.send('Loading server list...'), { filter: (_reaction: any, user: any) => user === msg.author });

		return null;
	}

}
