import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { GuildMember, MessageEmbed } from 'discord.js';
import { sendSimpleEmbeddedError, modLogMessage, getEmbedColor } from '../../lib/helpers';
import { stripIndents } from 'common-tags';
import { format } from 'date-fns';

module.exports = class extends Command {

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Soft-Bans the user, with a supplied reason',
			permissionLevel: 4, // BAN_MEMBERS
			requiredPermissions: ['BAN_MEMBERS'],
			usage: '<member:member> <reason:...string>'
		});
	}

	async run(msg, [member, reason]) {
		const banEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/hammer_1f528.png',
				name: 'Ban Hammer (Softly)'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		// Check if user is able to ban the mentioned user
		if (!member.bannable || member.roles.highest.position >= msg.member.roles.highest.position) {
			return sendSimpleEmbeddedError(msg, `I can't soft-ban <@${member.id}>. Do they have the same or a higher role than me or you?`, 3000);
		}

		try {
			// Ban
			await msg.guild.member.ban(member, { reason: `Soft-Banned by: ${msg.author} for: ${reason}` });

			await msg.guild.members.unban(member, 'Softban released.');

			// Set up embed message
			banEmbed.setDescription(stripIndents`
			**Moderator:** ${msg.author.tag} (${msg.author.id})
			**Member:** ${member.user.tag} (${member.id})
			**Action:** Soft Ban
			**Reason:** ${reason}`);

			modLogMessage(msg, banEmbed);

			// Send the success response
			return msg.sendEmbed(banEmbed);
		} catch (err) {
			this.catchError(msg, { member: member, reason: reason }, err);
		}
	}

	private catchError(msg: KlasaMessage, args: { member: GuildMember, reason: string }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
			Error occurred in \`softban\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`${args.member.user.tag} (${args.member.id})\` || \`${args.reason}\`
			**Error Message:** ${err}
		`);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, `Soft-Banning ${args.member} for ${args.reason} failed!`, 3000);
	}
};
