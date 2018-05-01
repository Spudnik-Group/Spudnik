import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';

/**
 * Allows a member to unassign a role from themselves.
 *
 * @export
 * @class IAmNotCommand
 * @extends {Command}
 */
export default class IAmNotCommand extends Command {
	/**
	 * Creates an instance of IAmNotCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof IAmNotCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Used to remove a role to yourself.',
			group: 'roles',
			guildOnly: true,
			memberName: 'iamnot',
			name: 'iamnot',
			args: [
				{
					default: '',
					key: 'query',
					prompt: 'what role do you want removed from yourself?\n',
					type: 'string',
				},
			],
		});
	}

	/**
	 * Run the "iamnot" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof IAmNotCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		const roleEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			author: {
				name: 'Role Manager',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
			},
		});

		const role = msg.guild.roles.find((r) => r.name.toLowerCase() === args.query.toLowerCase());
		const guildAssignableRoles: string[] = msg.client.provider.get(msg.guild, 'assignableRoles', []);

		if (role && guildAssignableRoles) {
			if (guildAssignableRoles.includes(role.id)) {
				msg.member.roles.remove(role.id);

				roleEmbed.description = `Removed ${role.name} from your roles.`;

				return msg.embed(roleEmbed);
			} else {
				roleEmbed.description = `You do not have the role ${role.name}.`;

				return msg.embed(roleEmbed);
			}
		} else {
			roleEmbed.description = `Cannot find ${args.query} in list of assignable roles.`;

			return msg.embed(roleEmbed);
		}
	}
}
