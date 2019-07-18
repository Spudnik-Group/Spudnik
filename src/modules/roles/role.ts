import { stripIndents } from 'common-tags';
import { Message, MessageEmbed, Role, Guild, ColorResolvable } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, stopTyping } from '../../lib/helpers';
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
					key: 'role',
					prompt: 'What role?\n',
					type: 'string'
				},
				{
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

				msg.guild.roles.create({
					data: {
						color: args.color,
						name: args.name
					}
				})
				.then(() => {
					roleEmbed.setDescription(stripIndents`
                        **Member:** ${msg.author.tag} (${msg.author.id})
                        **Action:** Added role '${args.name}' to the guild.
                    `);
				})
				.catch((err: Error) => this.catchError(msg, args, err));

				break;
			}
			case 'remove': {
				if (!args.name) {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, 'No role specified!', 3000);
				}

				if(!msg.guild.roles.has(args.name)){
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, 'Invalid role specified!', 3000);
				}

				if (msg.guild.roles.delete(args.name)) {
					roleEmbed.setDescription(stripIndents`
                        **Member:** ${msg.author.tag} (${msg.author.id})
                        **Action:** Removed role '${args.name}' to the guild.
					`);
					
					return this.sendSuccess(msg, roleEmbed);
				} else {
					this.catchError(msg, args, null);
				}

				break;
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

	private sendSuccess(msg: CommandoMessage, embed: MessageEmbed): Promise<Message | Message[]> {
		modLogMessage(msg, embed);
		deleteCommandMessages(msg);
		stopTyping(msg);

		// Send the success response
		return msg.embed(embed);
	}
}
