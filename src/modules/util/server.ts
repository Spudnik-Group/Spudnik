import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getJsonObject } from '../../lib/helpers';

const servers = getJsonObject('../config/servers.json');

/**
 * Posts information about the guild's servers.
 * 
 * @export
 * @class ServerCommand
 * @extends {Command}
 */
export default class ServerCommand extends Command {
	/**
	 * Creates an instance of ServerCommand.
	 * 
	 * @param {CommandoClient} client 
	 * @memberof ServerCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['servers'],
			description: 'Shows available servers.',
			details: `list|${servers.map((server: any) => server.key).join('|')}`,
			group: 'util',
			guildOnly: true,
			memberName: 'server',
			name: 'server',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					default: 'list',
					key: 'query',
					prompt: 'What server would you like info on?',
					type: 'string',
				},
			],
		});
	}

	/**
	 * Run the "servers" command.
	 * 
	 * @param {CommandMessage} msg 
	 * @param {{ query: string }} args 
	 * @returns {(Promise<Message | Message[] | any>)} 
	 * @memberof ServerCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[] | any> {
		if (args.query.toLowerCase() === 'list') {
			return msg.embed(new MessageEmbed({
				title: `${msg.guild.name} Servers`,
				description: servers.map((server: any) => server.key).sort().join('\n'),
				color: 5592405,
			}));
		} else {
			const info = servers.filter((server: any) => server.key.toLowerCase() === args.query.toLowerCase())[0];
			if (info) {
				return msg.embed(new MessageEmbed({
					title: info.title,
					description: info.description,
					color: 5592405,
				}));
			}
		}
	}
}
