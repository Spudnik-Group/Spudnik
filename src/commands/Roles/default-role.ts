import { stripIndents } from 'common-tags';
import { MessageEmbed, Role } from 'discord.js';
import { getEmbedColor, modLogMessage, sendSimpleEmbeddedError } from '../../lib/helpers';
import * as format from 'date-fns/format';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: [
				'dr'
			],
			requiredPermissions: ['MANAGE_ROLES'],
			description: 'Used to configure the default role for the `accept` command.',
			extendedHelp: stripIndents`
                syntax: \`!dr (@roleMention)\`
                
				\`(@roleMention)\` - sets the default role, or clears all if no role is provided.

				\`MANAGE_ROLES\` permission required.
			`,
			name: 'default-role',
			permissionLevel: 2,
			usage: '[role:Role]'
		});
	}

	/**
	 * Run the "role" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ subCommand: string, role: Role }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof RoleManagementCommands
	 */
	public async run(msg: KlasaMessage, [role]): Promise<KlasaMessage | KlasaMessage[]> {
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

		let guildDefaultRoles: string[] = await msg.guild.settings.get('defaultRoles') || [];

		if (!role) {
			try {
				await msg.guild.settings.reset('defaultRoles');
				// Set up embed message
				roleEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Removed default role(s).
				`);

				return this.sendSuccess(msg, roleEmbed);
			} catch (err) {
				this.catchError(msg, role, err);
			}
		} else if (!guildDefaultRoles.includes(role.id)) {
			guildDefaultRoles.push(role.id);

			try {
				await msg.guild.settings.update('defaultRoles', guildDefaultRoles);
				// Set up embed message
				roleEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Added role '${role.name}' to the list of default roles.
				`);

				return this.sendSuccess(msg, roleEmbed);
			} catch (err) {
				// TODO: make the error handling the same?
				msg.client.emit('warn', `Error in command roles:role-add: ${err}`);

				return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
			}
		}
	}

	private catchError(msg: KlasaMessage, role: Role, err: Error) {
		// Build warning message
		const roleWarn = stripIndents`
			Error occurred in \`role-management\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`Role name: ${role}
			**Error Message:** Setting default role failed!\n
			`;
		let roleUserWarn = 'Setting default role failed!';

		// Emit warn event for debugging
		msg.client.emit('warn', roleWarn);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, roleUserWarn);
	}

	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		modLogMessage(msg, embed);

		// Send the success response
		return msg.sendEmbed(embed);
	}
}
