/**
 * Copyright 2019 - Spudnik Group
 *
 * @summary Returns a list of servers the bot is in.
 * @author Spudnik Group <comrades@spudnik.io> (https://spudnik.io)
 *
 * Created at     : 2019-08-30 11:44:15 
 * Last modified  : 2019-08-30 12:23:30
 */

import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import * as format from 'date-fns/format';
import { getEmbedColor } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage, RichDisplay } from 'klasa';

/**
 * Returns a list of servers the bot is in.
 *
 * @export
 * @class ListServersCommand
 * @extends {Command}
 */
export default class ListServersCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['ls'],
			description: 'Returns a list of servers the bot is in.',
			guarded: true,
			hidden: true,
			name: 'list-servers'
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
			.setDescription(`Spudnik is connected to **${totalGuilds}** servers${this.client.shard ? `, in Shard ${this.client.shard.id}` : ''}.`)
		)
		let noOfPages = Math.ceil(totalGuilds / 5);
		for (let i = 0; i < noOfPages; i++) {
			guilds = guilds.slice(i * 5, (i * 5) + 5);
			display.addPage((template: MessageEmbed) => {
				guilds.forEach(guild => {
					template.fields.push({
						name: guild.name,
						value: stripIndents`
							ID: ${guild.id}
							User Count: ${guild.memberCount}
							Channel Count: ${guild.channels.size}
							Bot Invited: ${format(guild.joinedTimestamp, 'MMMM Do YYYY [at] HH:mm')}
							Owner: ${guild.owner.user.tag} (${guild.ownerID})
							Region: ${guild.region}
							Prefix: ${msg.guildSettings.get('prefix') ? msg.guildSettings.get('prefix') : '!'}
		
							--
						`
					});
				});
				
                return template;
			});
		}
		// @ts-ignore // RichDisplay doesn't like this syntax in TS, but it works.
		return display.run(await msg.send('Loading server list...'), { filter: (reaction: any, user: any) => user === msg.author });
	}
}
