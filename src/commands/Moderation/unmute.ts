import { Command, KlasaClient, CommandStore } from "klasa";
import { MessageEmbed } from "discord.js";
import { getEmbedColor, sendSimpleEmbeddedError, modLogMessage } from "src/lib/helpers";
import { stripIndents } from "common-tags";
import format = require("date-fns/format");

module.exports = class extends Command {

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			permissionLevel: 6,
			requiredPermissions: ['MANAGE_ROLES'],
			description: 'Unmutes a mentioned user.',
			usage: '<member:member> [reason:...string]'
		});
	}

	async run(msg, [member, reason]) {
		const muteEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/223/speaker-with-cancellation-stroke_1f507.png',
				name: 'Mute'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		// Check if user is able to mute the mentioned user
		if (member.roles.highest.position >= msg.member.roles.highest.position) {
			return sendSimpleEmbeddedError(msg, 'You cannot unmute this user. Do they have the same or higher role than you?', 3000);
		}
		// Check if the mentioned user is already muted
		if (!member.roles.has(msg.guild.settings.roles.muted)) {
			return sendSimpleEmbeddedError(msg, 'The member is not muted.', 3000);
		}

		try {
			await member.roles.remove(msg.guild.settings.roles.muted);
			// Set up embed message
			muteEmbed.setDescription(stripIndents`
					**Moderator:** ${msg.author.tag} (${msg.author.id})
					**Member:** ${member.user.tag} (${member.id})
					**Action:** UnMute
					**Reason:** ${reason ? reason : 'no reason'}
				`);

			modLogMessage(msg, muteEmbed);
			// Send the success response
			return msg.sendEmbed(muteEmbed);
		} catch (err) {
			// Emit warn event for debugging
			msg.client.emit('warn', stripIndents`
				Error occurred in \`unmute\` command!
				**Server:** ${msg.guild.name} (${msg.guild.id})
				**Author:** ${msg.author.tag} (${msg.author.id})
				**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
				**Input:** \`${member.user.tag} (${member.id})\` || \`${reason}\`
				**Error Message:** ${err}`);

			// Inform the user the command failed
			return sendSimpleEmbeddedError(msg, `UnMuting ${member} for ${reason ? reason : 'no reason'} failed!`, 3000);
		}
	}
};
