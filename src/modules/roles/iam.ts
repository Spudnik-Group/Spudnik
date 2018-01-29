import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';

// tslint:disable-next-line:no-var-requires
const { defaultEmbedColor }: { defaultEmbedColor: string } = require('../config/config.json');

export default class IAmNotCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Used to retrieve specific information about a brewery or brew.',
			group: 'roles',
			guildOnly: true,
			memberName: 'iamnot',
			name: 'iamnot',
			args: [
				{
					default: '',
					key: 'query',
					prompt: 'what role do you want added to yourself?\n',
					type: 'string',
				},
			],
		});
	}

	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		const roleEmbed = new MessageEmbed({
			color: defaultEmbedColor,
			author: {
				name: 'Role Manager',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
			},
		});

		const role = msg.guild.roles.find((r) => r.name.toLowerCase() === args.query.toLowerCase());
		const { guildAssignableRoles } = msg.client.provider.get(msg.guild, 'assignableRoles', { guildAssignableRoles: [] });

		if (role && guildAssignableRoles) {
			if (!guildAssignableRoles.includes(role.id)) {
				msg.member.addRole(role.id);

				roleEmbed.description = `Added ${role.name} from your roles.`;

				return msg.embed(roleEmbed);
			} else {
				roleEmbed.description = `You already have the role ${role.name}.`;

				return msg.embed(roleEmbed);
			}
		} else {
			roleEmbed.description = `Cannot find ${args.query} in list of assignable roles.`;

			return msg.embed(roleEmbed);
		}
	}
}
