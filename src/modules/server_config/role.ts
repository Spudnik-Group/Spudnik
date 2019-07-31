import { stripIndents } from 'common-tags';
import { Collection, Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, stopTyping, isNormalInteger } from '../../lib/helpers';
import * as format from 'date-fns/format';

/**
 * Manage guild roles.
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
					prompt: 'What is the name of the role? Wrap role names with spaces inside of double quotes.\n',
					type: 'string'
				},
				{
					default: '',
					key: 'color',
					prompt: 'What color would you like the role to be?\n',
					type: 'string',
					validate: (color: string) => {
						if (!isNaN(color.match(/^ *[a-f0-9]{6} *$/i) ? parseInt(color, 16) : NaN)) {
							return true;
						} else if (color === '') {
							return true;
						}
						
						return 'You provided an invalid color hex number. Please try again.';
					}
				}
			],
			clientPermissions: ['MANAGE_ROLES'],
			description: 'Used to add or remove roles from your server.',
			details: stripIndents`
				syntax: \`!sar <add|remove> <@roleMention|newRoleName> (hexcolor)\`

				\`add "role name" (hexcolor)\` - adds the role to your guild with the supplied color.
				\`remove "role name"\` - removes the role from your guild.

				MANAGE_ROLES permission required.
			`,
			examples: [
				'!role add PUBG',
				'!role add PUBG 0000FF',
				'!role add "test role"',
				'!role add "test role" 0000FF',
				'!role remove Fortnite'
			],
			group: 'server_config',
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
				try {
					let roleMetaData = {};
					if (args.color !== '') {
						roleMetaData = {
							data: {
								color: args.color,
								name: args.name
							}
						};
					} else {
						roleMetaData = {
							data: {
								name: args.name
							}
						};
					}
					//TODO: add a reason
					await msg.guild.roles.create(roleMetaData);
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
				const rolesFound: Collection<string, Role> = await msg.guild.roles.filter(role => role.name.toLocaleLowerCase() === args.name.toLocaleLowerCase());

				if (rolesFound.size > 1) {
					const rolesFoundArray = rolesFound.array();

					roleEmbed.setDescription(stripIndents`
						More than one role was found matching the provided name.
						Which role would you like to delete?\n
						${rolesFoundArray.map((role, i) => `**${i + 1}** - \`${role.id}\` - <@&${role.id}> - ${role.members.size} members`).join('\n')}`);

					await msg.embed(roleEmbed);
					stopTyping(msg);

					const filter = (res: Message) => {
						return (res.author.id === msg.author.id);
					}

					try {
						const responses = await msg.channel.awaitMessages(filter, { max: 1 });
						const response = responses.first();
	
							if (isNormalInteger(response.content) && ((-1 < Number(response.content)) && (Number(response.content) < rolesFoundArray.length))) {
								try {
									//TODO: add a reason
									await rolesFoundArray[Number(response.content) - 1].delete();
								} catch (err) {
									return this.catchError(msg, args, err);
								}
								roleEmbed.setDescription(stripIndents`
									**Member:** ${msg.author.tag} (${msg.author.id})
									**Action:** Removed role \`${response}\` from the guild.
								`);
								modLogMessage(msg, roleEmbed);
								deleteCommandMessages(msg);
								stopTyping(msg);

								return msg.embed(roleEmbed);
							} else {
								stopTyping(msg);
	
								return sendSimpleEmbeddedError(msg, 'Please supply a row number corresponding to the role you want to delete.');
							}
					} catch (err) {
						stopTyping(msg);

						return this.catchError(msg, args, err);
					}
				} else {
					const roleToDelete = rolesFound.first();

					try {
						//TODO: add a reason
						await roleToDelete.delete();
					} catch (err) {
						return this.catchError(msg, args, err);
					}
					roleEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Removed role \`${roleToDelete.name}\` from the guild.
					`);
					modLogMessage(msg, roleEmbed);
					deleteCommandMessages(msg);
					stopTyping(msg);

					return msg.embed(roleEmbed);
				}
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
			Error occurred in \`role\` command!
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
