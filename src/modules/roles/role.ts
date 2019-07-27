import { stripIndents } from 'common-tags';
import { Collection, Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, stopTyping, isNormalInteger } from '../../lib/helpers';
import * as format from 'date-fns/format';

/**
 * Manage self-assignable roles.
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
					prompt: 'What sub-command would you like to use?\nOptions are:\n* add\n* remove',
					type: 'string',
					validate: (subCommand: string) => {
						const allowedSubcommands = ['add', 'remove'];
						if (allowedSubcommands.indexOf(subCommand) !== -1) return true;

						return 'You provided an invalid sub-command.\nOptions are:\n* add\n* remove';
					}
				},
				{
					key: 'name',
					prompt: 'What role?\n',
					type: 'string'
				},
				{
					default: '',
					key: 'color',
					prompt: 'What color?\n',
					type: 'string'
				}
			],
			clientPermissions: ['MANAGE_ROLES'],
			description: 'Used to configure the self-assignable roles feature.',
			details: stripIndents`
				syntax: \`!sar <add|remove> (@roleMention)\`

				\`add <@roleMention>\` - adds the role to your guild.
				\`remove <@roleMention>\` - removes the role from your guild.

				MANAGE_ROLES permission required.
			`,
			examples: [
				'!role add @PUBG',
				'!role remove @Fortnite'
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
	public async run(msg: CommandoMessage, args: { subCommand: string, name: string, color: string }): Promise<Message | Message[]> {
		const roleEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
				name: 'Role Manager'
			},
			color: getEmbedColor(msg),
			footer: {
				text: 'Use the `role` command to add/remove a role from your guild'
			}
		}).setTimestamp();

		startTyping(msg);

		switch (args.subCommand.toLowerCase()) {
			case 'add': {
				if (!args.name) {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, 'No role specified!', 3000);
				}

				try {
					await msg.guild.roles.create({
						data: {
							color: args.color,
							name: args.name
						}
					});
				} catch (err) {
					return this.catchError(msg, args, err);
				}

				roleEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Added role '${args.name}' to the guild.
				`);

				modLogMessage(msg, roleEmbed);
				deleteCommandMessages(msg);
				stopTyping(msg);

				return msg.embed(roleEmbed);
			}
			case 'remove': {
				if (!args.name) {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, 'No role specified!', 3000);
				}

				const rolesFound: Collection<string, Role> = msg.guild.roles.filter(role => role.name.toLocaleLowerCase() === args.name.toLocaleLowerCase());

				if (rolesFound.size > 1) {
					const rolesFoundArray = rolesFound.array();

					roleEmbed.setDescription(stripIndents`
						More than one role was found matching the provided name.
						Which role would you like to delete?\n
						${rolesFoundArray.map((role, i) => `**${i + 1}** - \`${role.id}\` - <@&${role.id}> - ${role.members.size} members`).join('\n')}`);

					await msg.embed(roleEmbed);
					stopTyping(msg);

					const filter = (res: any) => {
						return (res.author.id === msg.author.id);
					}

					msg.channel.awaitMessages(filter, { max: 1 }).then(responses => {
						const response = responses.first();


						if(isNormalInteger(response.content) && (Number(response.content) < rolesFoundArray.length)) {
							rolesFoundArray[Number(response.content) - 1].delete().then(deletedRole => {
								roleEmbed.setDescription(`${deletedRole.name} has been removed!`);

								return msg.embed(roleEmbed);
							}).catch(() => {

								return sendSimpleEmbeddedError(msg, 'There was an issue deleting the specified role...');
							});
						} else {
							return sendSimpleEmbeddedError(msg, 'Please supply a row number corresponding to the role you want to delete.');
						}
					}).catch(() => {
						return sendSimpleEmbeddedError(msg, 'Command cancelled...');
					});


				} else {
					return null;
				}

				/*

				console.log(rolesFound.size);

				if (role === undefined) {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, 'Invalid role specified!', 3000);
				}

				try {
					await role.delete();
				} catch (err) {
					return this.catchError(msg, args, null);
				}
				
				roleEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Removed role \`${args.name}\` from the guild.
				`);
				*/
				break;
			}
			default: {
				stopTyping(msg);

				// Send the success response
				return sendSimpleEmbeddedError(msg, 'Invalid subcommand!');
			}
		}

		
	}

	private catchError(msg: CommandoMessage, args: { subCommand: string, name: string, color: string }, err: Error) {
		// Build warning message
		let roleWarn = stripIndents`
			Error occurred in \`role-management\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`Role ${args.subCommand.toLowerCase()}\` | role name: ${args.name} | color: ${args.color}`;
		let roleUserWarn = '';

		switch (args.subCommand.toLowerCase()) {
			case 'add': {
				roleUserWarn = 'Adding new role failed!\n';
				break;
			}
			case 'remove': {
				roleUserWarn = 'Removing role failed!\n';
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
}
