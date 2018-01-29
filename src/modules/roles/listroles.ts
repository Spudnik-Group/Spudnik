import { Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';

// tslint:disable-next-line:no-var-requires
const { defaultEmbedColor }: { defaultEmbedColor: string } = require('../config/config.json');

export default class ListRolesCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Used to list assignable and default roles.',
			group: 'roles',
			guildOnly: true,
			memberName: 'listroles',
			name: 'listroles',
		});
	}

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		const roleEmbed = new MessageEmbed({
			color: defaultEmbedColor,
			author: {
				name: 'Role Manager',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
			},
		});

		const guildAssignableRoles: string[] = msg.client.provider.get(msg.guild, 'assignableRoles', []);
		const guildDefaultRole: string = msg.client.provider.get(msg.guild, 'defaultRole', '');

		const fields: any = [];

		if (guildAssignableRoles.length > 0) {
			let roles: string[] = [];
			for (const roleId in guildAssignableRoles) {
				const role: Role = msg.guild.roles.find((r) => r.id === roleId);
				if (role) {
					roles.push(role.name);
				}
			}

			fields.push({
				name: 'Assignable Roles',
				value: roles.join('\n'),
				inline: true,
			});
		}

		if (guildDefaultRole !== '') {
			const role: Role = msg.guild.roles.find((r) => r.id === guildDefaultRole);

			if (role) {
				fields.push({
					name: 'Default Role',
					value: role.name,
					inline: true,
				});
			}
		}

		if (fields !== []) {
			roleEmbed.fields = fields;
		} else {
			roleEmbed.description = 'A default role and assignable roles are not set for this guild.';
		}

		return msg.embed(roleEmbed);
	}
}
