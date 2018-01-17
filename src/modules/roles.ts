import chalk from 'chalk';
import { Message, RichEmbed } from 'discord.js';
import { Role } from '../lib/config';
import { GuildAssignableRolesSchema } from '../lib/schemas/guild-assignable-roles-schema';
import { Spudnik } from '../spudnik';

module.exports = (Spudnik: Spudnik) => {
	// tslint:disable:object-literal-sort-keys
	function createEmbed(info: string) {
		return new RichEmbed({
			color: Spudnik.Config.getDefaultEmbedColor(),
			author: {
				name: 'Role Manager',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
			},
			description: info,
		});
	}

	return {
		commands: [
			'iam',
			'iamnot',
			'role',
		],
		iam: {
			usage: '',
			description: '',
			process: (msg: Message, suffix: string) => {
				const role = msg.guild.roles.find((r) => r.name.toLowerCase() === suffix);
				const guildRoles = Spudnik.Config.roles[msg.guild.id];

				if (guildRoles) {
					const roles = guildRoles.assignable;

					if (roles && roles.includes(role.id)) {
						msg.member.addRole(role.id);

						return Spudnik.processMessage(createEmbed(`Added ${role.name} to your roles.`), msg, false, false);
					}
				}
			},
		},
		iamnot: {
			usage: '',
			description: '',
			process: (msg: Message, suffix: string) => {
				const role = msg.guild.roles.find((r) => r.name.toLowerCase() === suffix);
				const guildRoles = Spudnik.Config.roles[msg.guild.id];

				if (role && guildRoles) {
					const roles = guildRoles.assignable;

					if (roles && roles.includes(role.id)) {
						msg.member.removeRole(role.id);

						Spudnik.processMessage(createEmbed(`Removed ${role.name} from your roles.`), msg, false, false);
					}
				}
			},
		},
		role: {
			usage: 'add|remove|default|list <role name>',
			description: '',
			process: (msg: Message, suffix: string) => {
				const guildAssignableRolesSet = Spudnik.Database.model('GuildAssignableRolesSchema', GuildAssignableRolesSchema);

				const params = suffix.split(' ');
				const command = params.shift();
				suffix = params.join(' ');

				let guildRoles = Spudnik.Config.roles[msg.guild.id];

				if (!guildRoles) {
					Spudnik.Config.roles[msg.guild.id] = new Role();
					Spudnik.Config.roles[msg.guild.id].assignable = [];

					guildRoles = Spudnik.Config.roles[msg.guild.id];
				}

				const roles = guildRoles.assignable;

				switch (command) {
					case 'add':
						if (msg.member.hasPermission('MANAGE_ROLES')) {
							try {
								const role = msg.guild.roles.find((r) => r.name.toLowerCase() === suffix);

								if (role) {
									if (!roles.includes(role.id)) {
										guildAssignableRolesSet.findOneAndUpdate({ guildId: msg.guild.id }, { $addToSet: { roleIds: role.id } }, { upsert: true }, (err: Error, result: any) => {
											if (err) {
												chalk.red(err.toString());
												return Spudnik.processMessage('Error saving role.', msg, false, false);
											} else {
												if (!result) {
													result = GuildAssignableRolesSchema;
													result.roleIds = [role.id];
												}

												result.save();

												console.log(chalk.blue(`Added ${role.name}:${role.id} on ${msg.guild.name}:${msg.guild.id} to self-assignable list.`));

												Spudnik.Config.roles[msg.guild.id].assignable.push(role.id);
												Spudnik.processMessage(`Added role <@${role.id}> to self-assignable list.`, msg, false, false);
											}
										});
									} else {
										Spudnik.processMessage(createEmbed('Already assigned.'), msg, false, false);
									}
								} else {
									Spudnik.processMessage(createEmbed('Not a valid role.'), msg, false, false);
								}
							} catch (err) {
								console.log(chalk.red(`Error: ${err}`));
							}
						}

						break;
					case 'remove':
						if (msg.member.hasPermission('MANAGE_ROLES')) {
							try {
								const role = msg.guild.roles.find((r) => r.name.toLowerCase() === suffix);

								if (role) {
									if (!roles.includes(role.id)) {
										guildAssignableRolesSet.update({ guildId: msg.guild.id }, { $pullAll: { roleIds: role.id } }, (err) => {
											if (err) {
												console.log(chalk.red(`Error: ${err}`));
												Spudnik.processMessage('Error removing role.', msg, false, false);
											} else {
												console.log(chalk.blue(`Removed ${role.name}:${role.id} on ${msg.guild.name}:${msg.guild.id} from self-assignable list.`));
												Spudnik.Config.roles[msg.guild.id].assignable.splice(Spudnik.Config.roles[msg.guild.id].assignable.indexOf(role.id), 1);
												Spudnik.processMessage(createEmbed(`Removed <@${role.id}> from self-assignable list.`), msg, false, false);
											}
										});
									} else {
										Spudnik.processMessage(createEmbed('This role is not self-assignable.'), msg, false, false);
									}
								} else {
									Spudnik.processMessage(createEmbed('Not a valid role.'), msg, false, false);
								}
							} catch (err) {
								console.log(chalk.red(`Error ${err}`));
							}
						}

						break;
					case 'default':

						break;
					case 'list':

						break;
					default:
						break;
				}
			},
		},
	};
};
