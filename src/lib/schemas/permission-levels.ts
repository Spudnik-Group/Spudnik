import { PermissionLevels } from 'klasa';
import { Permissions, Guild, GuildMember, Client, User } from 'discord.js';

export const permissionLevels = new PermissionLevels()
	.add(0, () => true)
	.add(1, ({ guild, member }: { guild: Guild; member: GuildMember }) => guild && member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES), { fetch: true })
	.add(2, ({ guild, member }: { guild: Guild; member: GuildMember }) => guild && member.permissions.has(Permissions.FLAGS.MANAGE_ROLES), { fetch: true })
	.add(3, ({ guild, member }: { guild: Guild; member: GuildMember }) => guild && member.permissions.has(Permissions.FLAGS.KICK_MEMBERS), { fetch: true })
	.add(4, ({ guild, member }: { guild: Guild; member: GuildMember }) => guild && member.permissions.has(Permissions.FLAGS.BAN_MEMBERS), { fetch: true })
	// TODO: add staff feature
	// .add(5, ({ guild, author }) => guild.settings.get(GuildSettings.Roles.Staff).includes(author.id));
	.add(6, ({ guild, member }: { guild: Guild; member: GuildMember }) => guild && member.permissions.has(Permissions.FLAGS.MANAGE_GUILD), { fetch: true })
	.add(7, ({ guild, member }: { guild: Guild; member: GuildMember }) => guild && member === guild.owner, { fetch: true })
	.add(9, ({ author, client }: { author: User; client: Client }) => client.owners.has(author), { 'break': true })
	.add(10, ({ author, client }: { author: User; client: Client }) => client.owners.has(author));
