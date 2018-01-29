import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getJsonObject, sendSimpleEmbededError } from '../../lib/helpers';

const servers = getJsonObject('../../config/servers.json');

export default class ServerCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['servers'],
			description: 'Shows the purpose of the chat channel.',
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
					default: '',
					key: 'query',
					prompt: 'What server would you like info on?',
					type: 'string',
				},
			],
		});
	}

	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		if (args.query.toLowerCase() === 'list' || args.query.trim() === '') {
			return msg.embed(new MessageEmbed({
				title: `${msg.guild.name} Servers`,
				description: servers.map((server: any) => server.key).sort().join('\n'),
				color: 5592405,
			}));
		} else {
			const info = servers.filter((server: any) => server.key === args.query.toLowerCase())[0];
			if (info) {
				return msg.embed(new MessageEmbed({
					title: info.title,
					description: info.description,
					color: 5592405,
				}));
			}
		}
		return sendSimpleEmbededError(msg, 'There was an error with the request. Try again?');
	}
}
