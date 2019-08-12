import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { stripIndents } from 'common-tags';
import * as format from 'date-fns/format';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Returns a list of servers the bot is in.
 *
 * @export
 * @class ListServersCommand
 * @extends {Command}
 */
export default class ListServersCommand extends Command {
	/**
	 * Creates an instance of ListServersCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ListServersCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['ls'],
			args: [
				{
					default: '1',
					key: 'page',
					label: 'Page',
					prompt: 'What page would you like to view?',
					type: 'integer'
				}
			],
			description: 'Returns a list of servers the bot is in.',
			details: stripIndents`
				Only the bot owner(s) may use this command.
			`,
			examples: ['list-servers'],
			group: 'bot_owner',
			guarded: true,
			hidden: true,
			memberName: 'list-servers',
			name: 'list-servers',
			ownerOnly: true
		});
	}

	/**
	 * Run the "ListServersCommand" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ page: number }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof ListServersCommand
	 */
	public async run(msg: CommandoMessage, args: {page: number}): Promise<Message | Message[]> {
		let guilds = Array.from(this.client.guilds.values());
		let totalGuilds = guilds.length;
		let noOfPages = totalGuilds / 2;
		let p = (args.page > 0 && args.page < noOfPages + 1) ? args.page : 1;
		p = p - 1;
		guilds = guilds.slice(p * 2, (p * 2) + 2);
		let fields: any[] = [];
		guilds.forEach(guild => {
			fields.push({
				name: guild.name,
				value: stripIndents`
					ID: ${guild.id}
					User Count: ${guild.memberCount}
					Channel Count: ${guild.channels.size}
					Bot Invited: ${format(guild.joinedTimestamp, 'MMMM Do YYYY [at] HH:mm')}
					Owner: ${guild.owner} <${guild.ownerID}>
				`
			});
		});

		deleteCommandMessages(msg);
		
		return msg.reply({
			embed: {
				color: getEmbedColor(msg),
				description: `Spudnik is connected to **${totalGuilds}** servers${this.client.shard ? `, in Shard ${this.client.shard.id}` : ''}.`,
				fields: fields,
				footer: {
					text: `Page: ${p + 1} of ${noOfPages > noOfPages ? noOfPages + 1 : noOfPages}`
				},
				title: 'Server List'
			}
		});
	}
}
