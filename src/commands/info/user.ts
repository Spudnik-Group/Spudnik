/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed, User, GuildMember } from 'discord.js';
import { trimArray, getEmbedColor } from '../../lib/helpers';
import { stripIndents } from 'common-tags';
import { Command, KlasaClient, CommandStore, KlasaMessage, Timestamp } from 'klasa';

const activities = {
	LISTENING: 'Listening to',
	PLAYING: 'Playing',
	STREAMING: 'Streaming',
	WATCHING: 'Watching'
};
const statuses = {
	dnd: '❤ Do Not Disturb',
	idle: '💛 Idle',
	offline: '💔 Offline',
	online: '💚 Online'
};

/**
 * Returns statistics about a user.
 *
 * @export
 * @class UserCommand
 * @extends {Command}
 */
export default class UserCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['user-stats'],
			description: 'Returns statistics about a user.',
			extendedHelp: stripIndents`
				Supplying no usermention returns details about the calling user.
			`,
			name: 'user',
			usage: '[user:user]'
		});
	}

	/**
	 * Run the "user" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof UserCommand
	 */
	public async run(msg: KlasaMessage, [user]): Promise<KlasaMessage | KlasaMessage[]> {
		const currentUser: User = user ? user : msg.author;
		const avatarFormat = currentUser.avatar && currentUser.avatar.startsWith('a_') ? 'gif' : 'png';
		const userEmbed = new MessageEmbed()
			.setThumbnail(currentUser.displayAvatarURL({ format: avatarFormat }))
			.setColor(getEmbedColor(msg))
			.addField('❯ Name', currentUser.tag, true)
			.addField('❯ ID', currentUser.id, true)
			.addField('❯ Discord Join Date', new Timestamp('MM/DD/YYYY h:mm A').display(currentUser.createdAt), true)
			.addField('❯ Bot?', currentUser.bot ? 'Yes' : 'No', true)
			.addField('❯ Status', statuses[user.presence.status], true);

		try {
			// Check if user is a member of the guild
			const member: GuildMember = await msg.guild.members.fetch(currentUser.id);
			const roles = member.roles
				.sort((a, b) => b.position - a.position)
				.map(role => role.name);
			userEmbed
				.setDescription(member.presence.activity
					? `${activities[member.presence.activity.type]} **${member.presence.activity.name}**`
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
