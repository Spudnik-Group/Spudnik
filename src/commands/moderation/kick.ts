import { stripIndents } from 'common-tags';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { getEmbedColor, modLogMessage, sendSimpleEmbeddedError } from '../../lib/helpers';
import * as format from 'date-fns/format';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Kick a member from the guild.
 *
 * @export
 * @class KickCommand
 * @extends {Command}
 */
export default class KickCommand extends Command {
	/**
	 * Creates an instance of KickCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof KickCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Kicks a user.',
			extendedHelp: stripIndents`
				syntax: \`!kick <@userMention> <reason>\`

				\`KICK_MEMBERS\` permission required.
			`,
			name: 'kick',
			usage: '<member:member> [reason:...string]',
			permissionLevel: 3,
			requiredPermissions: ['KICK_MEMBERS']
		});
	}

	/**
	 * Run the "kick" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ member: GuildMember, reason: string }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof KickCommand
	 */
	public async run(msg: KlasaMessage, [member, reason]): Promise<Message | Message[] | any> {
		const memberToKick: GuildMember = member;
		const kickEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/eject-symbol_23cf.png',
				name: 'Get Out! - уходить!!'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		// Check if user is able to kick the mentioned user
		if (!memberToKick.kickable || !(msg.member.roles.highest.comparePositionTo(memberToKick.roles.highest) > 0)) {
			return sendSimpleEmbeddedError(msg, `I can't kick ${memberToKick}. Do they have the same or a higher role than me or you?`, 3000);
		}

		try {
			await memberToKick.kick(`Kicked by: ${msg.author} for: ${reason}`);
			// Set up embed message
			kickEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**Member:** ${memberToKick.user.tag} (${memberToKick.id})
				**Action:** Kick
				**Reason:** ${reason}
			`);

			modLogMessage(msg, kickEmbed);
			// Send the success response
			return msg.sendEmbed(kickEmbed);
		} catch (err) {
			// Emit warn event for debugging
			msg.client.emit('warn', stripIndents`
			Error occurred in \`kick\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`${member.user.tag} (${member.id})\` || \`${reason}\`
			**Error Message:** ${err}`);

			// Inform the user the command failed
			return sendSimpleEmbeddedError(msg, `Kicking ${member} for ${reason} failed!`, 3000);
		}
	}
}
