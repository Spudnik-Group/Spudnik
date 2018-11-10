import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

/**
 * Allows a member to assign a role to themselves.
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
			args: [
				{
					key: 'query',
					prompt: 'What role do you want added to yourself?\n',
					type: 'string'
				}
			],
			clientPermissions: ['MANAGE_ROLES'],
			description: 'Used to add a self-assignable role to yourself.',
			details: 'syntax: `!iam <@roleMention>`',
			examples: ['!iam @Fortnite'],
			group: 'roles',
			guildOnly: true,
			memberName: 'iam',
			name: 'iam'
		});
	}

	/**
	 * Run the "iam" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof IAmNotCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		const roleEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
				name: 'Role Manager'
			},
			color: getEmbedColor(msg)
		});

		const role = msg.guild.roles.find((r) => r.name.toLowerCase() === args.query.toLowerCase());
		const guildAssignableRoles: string[] = msg.client.provider.get(msg.guild.id, 'assignableRoles', []);

		if (role && guildAssignableRoles) {
			if (!msg.member.roles.keyArray().includes(role.id)) {
				msg.member.roles.add(role.id);

				roleEmbed.description = `Added ${role.name} to your roles.`;

				return msg.embed(roleEmbed);
			} else {
				return sendSimpleEmbeddedError(msg, `You already have the role ${role.name}.`, 3000);
			}
		} else {
			return sendSimpleEmbeddedError(msg, `Cannot find ${args.query} in list of assignable roles.`, 3000);
		}
	}
}
