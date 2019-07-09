import { stripIndents } from 'common-tags';
import { Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, stopTyping } from '../../lib/helpers';
import * as format from 'date-fns/format';

/**
 * Manage roles including self-assigning, listing, and setting a default role.
 *
 * @export
 * @class RoleCommand
 * @extends {Command}
 */
export default class RoleCommand extends Command {
	/**
	 * Creates an instance of RoleCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof RoleCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'subCommand',
					prompt: 'What sub-command would you like to use?\nOptions are:\n* add\n* remove\n* default',
					type: 'string',
					validate: (subCommand: string) => {
						const allowedSubcommands = ['add', 'remove', 'default'];
						if (allowedSubcommands.indexOf(subCommand) !== -1) return true;
						
						return 'You provided an invalid sub-command.\nOptions are:\n* add\n* remove\n* list\n* default';
					}
				},
				{
					default: '',
					key: 'role',
					prompt: 'What role?\n',
					type: 'role'
				}
			],
			clientPermissions: ['MANAGE_ROLES'],
			description: 'Used to configure the role management feature.',
			details: stripIndents`
				syntax: \`!role <add|remove|default> (@roleMention)\`

				\`add <@roleMention>\` - adds the role to the list of self-assignable-roles.
				\`remove <@roleMention>\` - removes the role from the list of self-assignable-roles.
				\`default (@roleMention)\` - sets the default role, or clears all if no role is provided.

				MANAGE_ROLES permission required.
			`,
			examples: [
				'!role add @PUBG',
				'!role remove @Fortnite',
				'!role default @Pleb',
				'!role default'
			],
			group: 'feature',
			guildOnly: true,
			memberName: 'role',
			name: 'role',
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
	public async run(msg: CommandoMessage, args: { subCommand: string, role: Role }): Promise<Message | Message[]> {
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

		let guildAssignableRoles: string[] = await msg.guild.settings.get('assignableRoles', []);
		let guildDefaultRoles: string[] = await msg.guild.settings.get('defaultRoles', []);

		startTyping(msg);

		switch (args.subCommand.toLowerCase()) {
			case 'add': {
				if (!args.role) {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, 'No role specified!', 3000);
				}

				if (!guildAssignableRoles.includes(args.role.id)) {
					guildAssignableRoles.push(args.role.id);

					msg.guild.settings.set('assignableRoles', guildAssignableRoles)
						.then(() => {
							// Set up embed message
							roleEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Added role '${args.role.name}' to the list of assignable roles.
							`);

							return this.sendSuccess(msg, roleEmbed);
						})
						.catch((err: Error) => this.catchError(msg, args, err));
				} else {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, `${args.role.name} is already in the list of assignable roles for this guild.`, 3000);
				}
				break;
			}
			case 'remove': {
				if (!args.role) {
					stopTyping(msg);
					
					return sendSimpleEmbeddedError(msg, 'No role specified!', 3000);
				}

				if (guildAssignableRoles.includes(args.role.id)) {
					guildAssignableRoles = guildAssignableRoles.filter((i: string) => i !== args.role.id);

					msg.guild.settings.set('assignableRoles', guildAssignableRoles)
						.then(() => {
							// Set up embed message
							roleEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Removed role '${args.role.name}' from the list of assignable roles.
							`);

							return this.sendSuccess(msg, roleEmbed);
						})
						.catch((err: Error) => this.catchError(msg, args, err));
				} else {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, `Could not find role with name ${args.role.name} in the list of assignable roles for this guild.`, 3000);
				}
				break;
			}
			case 'default': {
				if (!args.role) {
					msg.guild.settings.set('defaultRoles', [])
						.then(() => {
							// Set up embed message
							roleEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Removed default role(s).
							`);

							return this.sendSuccess(msg, roleEmbed);
						})
						.catch((err: Error) => this.catchError(msg, args, err));
				} else if (!guildDefaultRoles.includes(args.role.id)) {
					guildDefaultRoles.push(args.role.id);

					msg.guild.settings.set('defaultRoles', guildDefaultRoles)
						.then(() => {
							// Set up embed message
							roleEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Added role '${args.role.name}' to the list of default roles.
							`);

							return this.sendSuccess(msg, roleEmbed);
						})
						.catch((err: Error) => {
							msg.client.emit('warn', `Error in command roles:role-add: ${err}`);

							return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
						});
				}
				break;
			}
		}
	}
	
	private catchError(msg: CommandoMessage, args: { subCommand: string, role: Role }, err: Error) {
		// Build warning message
		let roleWarn = stripIndents`
			Error occurred in \`role-management\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`Role ${args.subCommand.toLowerCase()}\` | role name: ${args.role}`;
		let roleUserWarn = '';

		switch (args.subCommand.toLowerCase()) {
			case 'default': {
				roleUserWarn = 'Setting/Clearing default role failed!\n';
				break;
			}
			case 'add': {
				roleUserWarn = 'Adding new role failed!\n';
				break;
			}
			case 'remove': {
				roleUserWarn = 'Removing role message!\n';
				break;
			}
		}
		
		roleWarn += `**Error Message:** ${err}`;
		
		stopTyping(msg);
		
		// Emit warn event for debugging
		msg.client.emit('warn', roleWarn);

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
