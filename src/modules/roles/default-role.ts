import { stripIndents } from 'common-tags';
import { Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, stopTyping } from '../../lib/helpers';
import * as format from 'date-fns/format';

/**
 * Manage setting a default role.
 *
 * @export
 * @class DefaultRoleCommand
 * @extends {Command}
 */
export default class DefaultRoleCommand extends Command {
	/**
	 * Creates an instance of RoleCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof RoleCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: [
				'dr'
			],
			args: [
				{
					default: '',
					key: 'role',
					prompt: 'What role?\n',
					type: 'role'
				}
			],
			clientPermissions: ['MANAGE_ROLES'],
			description: 'Used to configure the default role for the `accept` command.',
			details: stripIndents`
                syntax: \`!dr (@roleMention)\`
                
				\`(@roleMention)\` - sets the default role, or clears all if no role is provided.

				\`MANAGE_ROLES\` permission required.
			`,
			examples: [
				'!dr @Pleb',
				'!dr'
			],
			group: 'feature',
			guildOnly: true,
			memberName: 'default-role',
			name: 'default-role',
			userPermissions: ['MANAGE_ROLES']
		});
	}

	/**
	 * Run the "role" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ subCommand: string, role: Role }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof RoleManagementCommands
	 */
	public async run(msg: CommandoMessage, args: { role: Role }): Promise<Message | Message[]> {
		const roleEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
				name: 'Role Manager'
			},
			color: getEmbedColor(msg),
			footer: {
				text: 'Use the `roles` command to list the current default & assignable roles'
			}
		}).setTimestamp();

		let guildDefaultRoles: string[] = await msg.guild.settings.get('defaultRoles', []);

		startTyping(msg);

		if (!args.role) {
			try {
				await msg.guild.settings.set('defaultRoles', []);
				// Set up embed message
				roleEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Removed default role(s).
				`);

				return this.sendSuccess(msg, roleEmbed);
			} catch (err) {
				this.catchError(msg, args, err);
			}
		} else if (!guildDefaultRoles.includes(args.role.id)) {
			guildDefaultRoles.push(args.role.id);

			try {
				await msg.guild.settings.set('defaultRoles', guildDefaultRoles);
				// Set up embed message
				roleEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Added role '${args.role.name}' to the list of default roles.
				`);

				return this.sendSuccess(msg, roleEmbed);
			} catch (err) {
				// TODO: make the error handling the same?
				msg.client.emit('warn', `Error in command roles:role-add: ${err}`);

				return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
			}
		}
	}

	private catchError(msg: CommandoMessage, args: { role: Role }, err: Error) {
		// Build warning message
		const roleWarn = stripIndents`
			Error occurred in \`role-management\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`Role name: ${args.role}
			**Error Message:** Setting default role failed!\n
			`;
		// TODO: this needs updated
		let roleUserWarn = 'Setting default role failed!';

		// Emit warn event for debugging
		msg.client.emit('warn', roleWarn);

		deleteCommandMessages(msg);
		stopTyping(msg);		

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, roleUserWarn);
	}

	private sendSuccess(msg: CommandoMessage, embed: MessageEmbed): Promise<Message | Message[]> {
		modLogMessage(msg, embed);
		deleteCommandMessages(msg);
		stopTyping(msg);

		// Send the success response
		return msg.embed(embed);
	}
}
