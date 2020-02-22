/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, KlasaClient, CommandStore, Timestamp, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';

const perms = {
	ADD_REACTIONS: 'Add Reactions',
	ADMINISTRATOR: 'Administrator',
	ATTACH_FILES: 'Attach Files',
	BAN_MEMBERS: 'Ban Members',
	CHANGE_NICKNAME: 'Change Nickname',
	CONNECT: 'Connect',
	CREATE_INSTANT_INVITE: 'Create Instant Invite',
	DEAFEN_MEMBERS: 'Deafen Members',
	EMBED_LINKS: 'Embed Links',
	KICK_MEMBERS: 'Kick Members',
	MANAGE_CHANNELS: 'Manage Channels',
	MANAGE_EMOJIS: 'Manage Emojis',
	MANAGE_GUILD: 'Manage Server',
	MANAGE_MESSAGES: 'Manage Messages',
	MANAGE_NICKNAMES: 'Manage Nicknames',
	MANAGE_ROLES: 'Manage Roles',
	MANAGE_WEBHOOKS: 'Manage Webhooks',
	MENTION_EVERYONE: 'Mention Everyone',
	MOVE_MEMBERS: 'Move Members',
	MUTE_MEMBERS: 'Mute Members',
	READ_MESSAGE_HISTORY: 'Read Message History',
	SEND_MESSAGES: 'Send Messages',
	SEND_TTS_MESSAGES: 'Send TTS Messages',
	SPEAK: 'Speak',
	USE_EXTERNAL_EMOJIS: 'Use External Emojis',
	USE_VAD: 'Use Voice Activity',
	VIEW_AUDIT_LOG: 'View Audit Log',
	VIEW_CHANNEL: 'Read Text Channels and See Voice Channels'
};

export default class RoleComand extends Command {
	private timestamp: Timestamp;

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Get information on a role with an id or a mention.',
			name: 'role-info',
			usage: '<Role:role>'
		});
		this.timestamp = new Timestamp('dddd, MMMM d YYYY');
	}

	public async run(msg: KlasaMessage, [role]): Promise<KlasaMessage | KlasaMessage[]> {
		const allPermissions = Object.entries(role.permissions.serialize()).filter(perm => perm[1]).map(([perm]) => perms[perm]).join(', ');
		const defaultRole = await msg.guild.settings.get('roles.defaultRole');

		return msg.sendEmbed(new MessageEmbed()
			.setColor(role.hexColor || 0xFFFFFF)
			.addField('❯ Name', role.name, true)
			.addField('❯ ID', role.id, true)
			.addField('❯ Is Default Role', defaultRole === role, true)
			.addField('❯ Color', role.hexColor || 'None', true)
			.addField('❯ Creation Date', this.timestamp.display(role.createdAt), true)
			.addField('❯ Hoisted', role.hoist ? 'Yes' : 'No', true)
			.addField('❯ Mentionable', role.mentionable ? 'Yes' : 'No', true)
			.addField('❯ Permissions', allPermissions || 'None'));
	}
};
