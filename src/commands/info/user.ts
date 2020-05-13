/**
 * Copyright (c) 2020 Spudnik Group
 */

import { User, GuildMember, Role } from 'discord.js';
import { stripIndents } from 'common-tags';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { trimArray } from '@lib/utils/util';
import { statuses, activities } from '@lib/constants';

/**
 * Returns statistics about a user.
 *
 * @export
 * @class UserCommand
 * @extends {Command}
 */
export default class UserCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['user-stats'],
			description: 'Returns statistics about a user.',
			extendedHelp: stripIndents`
				Supplying no usermention returns details about the calling user.
			`,
			name: 'user',
			usage: '(user:optional-user)'
		});
	}

	/**
	 * Run the "user" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof UserCommand
	 */
	public async run(msg: KlasaMessage, [user = msg.author]: [User]): Promise<KlasaMessage | KlasaMessage[]> {
		const userEmbed = baseEmbed(msg)
			.setThumbnail(user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.addField('❯ Name', user.tag, true)
			.addField('❯ ID', user.id, true)
			.addField('❯ Discord Join Date', new Timestamp('MM/DD/YYYY h:mm A').display(user.createdAt), true)
			.addField('❯ Bot?', user.bot ? 'Yes' : 'No', true)
			.addField('❯ Status', statuses[user.presence.status], true);

		try {
			// Check if user is a member of the guild
			const member: GuildMember = await msg.guild.members.fetch(user.id);
			const roles = member.roles
				.sort((a: Role, b: Role) => b.position - a.position)
				.map((role: Role) => role.name);
			userEmbed
				.setDescription(member.presence.activities.length
					? `${activities[member.presence.activities[0].type]} **${member.presence.activities[0].state ? member.presence.activities[0].state : member.presence.activities[0].name}**`
					: '')
				.addField('❯ Server Join Date', new Timestamp('MM/DD/YYYY h:mm A').display(member.joinedAt), true)
				.addField('❯ Nickname', member.nickname || 'None', true)
				.addField('❯ Highest Role', member.roles.highest.name, true)
				.addField('❯ Hoist Role', member.roles.hoist ? member.roles.hoist.name : 'None', true)
				.addField(`❯ Roles (${roles.length})`, roles.length ? trimArray(roles, 10).join(', ') : 'None');

			return msg.sendEmbed(userEmbed);
		} catch (err) {
			userEmbed.setFooter('Failed to resolve member, showing basic user information instead.');

			return msg.sendEmbed(userEmbed);
		}
	}

}
