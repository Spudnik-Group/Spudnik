import { Command, KlasaClient, CommandStore, Timestamp, KlasaMessage } from "klasa";
import { MessageEmbed } from "discord.js";

const perms = {
	ADMINISTRATOR: 'Administrator',
	VIEW_AUDIT_LOG: 'View Audit Log',
	MANAGE_GUILD: 'Manage Server',
	MANAGE_ROLES: 'Manage Roles',
	MANAGE_CHANNELS: 'Manage Channels',
	KICK_MEMBERS: 'Kick Members',
	BAN_MEMBERS: 'Ban Members',
	CREATE_INSTANT_INVITE: 'Create Instant Invite',
	CHANGE_NICKNAME: 'Change Nickname',
	MANAGE_NICKNAMES: 'Manage Nicknames',
	MANAGE_EMOJIS: 'Manage Emojis',
	MANAGE_WEBHOOKS: 'Manage Webhooks',
	VIEW_CHANNEL: 'Read Text Channels and See Voice Channels',
	SEND_MESSAGES: 'Send Messages',
	SEND_TTS_MESSAGES: 'Send TTS Messages',
	MANAGE_MESSAGES: 'Manage Messages',
	EMBED_LINKS: 'Embed Links',
	ATTACH_FILES: 'Attach Files',
	READ_MESSAGE_HISTORY: 'Read Message History',
	MENTION_EVERYONE: 'Mention Everyone',
	USE_EXTERNAL_EMOJIS: 'Use External Emojis',
	ADD_REACTIONS: 'Add Reactions',
	CONNECT: 'Connect',
	SPEAK: 'Speak',
	MUTE_MEMBERS: 'Mute Members',
	DEAFEN_MEMBERS: 'Deafen Members',
	MOVE_MEMBERS: 'Move Members',
	USE_VAD: 'Use Voice Activity'
};

export default class extends Command {
	private timestamp: Timestamp;

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			runIn: ['text'],
			description: 'Get information on a role with an id or a mention.',
			name: 'role-info',
			usage: '<Role:role>'
		});
		this.timestamp = new Timestamp('dddd, MMMM d YYYY');
	}

	async run(msg: KlasaMessage, [role]) {
		const allPermissions = Object.entries(role.permissions.serialize()).filter(perm => perm[1]).map(([perm]) => perms[perm]).join(', ');
		const defaultRoles = await msg.guild.settings.get('roles.defaultRoles');

		return msg.sendEmbed(new MessageEmbed()
			.setColor(role.hexColor || 0xFFFFFF)
			.addField('❯ Name', role.name, true)
			.addField('❯ ID', role.id, true)
			.addField('❯ Is Default Role', defaultRoles.includes(role.id), true)
			.addField('❯ Color', role.hexColor || 'None', true)
			.addField('❯ Creation Date', this.timestamp.display(role.createdAt), true)
			.addField('❯ Hoisted', role.hoist ? 'Yes' : 'No', true)
			.addField('❯ Mentionable', role.mentionable ? 'Yes' : 'No', true)
			.addField('❯ Permissions', allPermissions || 'None'));
	}
};
