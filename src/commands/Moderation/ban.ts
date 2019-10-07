import { stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed, Role } from 'discord.js';
import { getEmbedColor, modLogMessage, sendSimpleEmbeddedError } from '../../lib/helpers';
import * as format from 'date-fns/format';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Ban a member and optionally delete past messages.
 *
 * @export
 * @class BanCommand
 * @extends {Command}
 */
export default class BanCommand extends Command {
	/**
	 * Creates an instance of BanCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof BanCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['BAN_MEMBERS'],
			description: 'Bans the user, with a supplied reason',
			extendedHelp: stripIndents`
				syntax: \`!ban <@userMention> <reason>\`

				\`BAN_MEMBERS\` permission required.
			`,
			name: 'ban',
			permissionLevel: 6,
			usage: '<member:user> <reason:...string>'
		});
	}

	/**
	 * Run the "ban" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ member: GuildMember, reason: string, daysOfMessages: number }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof BanCommand
	 */
	public async run(msg: KlasaMessage, [member, reason]): Promise<KlasaMessage | KlasaMessage[]> {
		const memberToBan: GuildMember = member;
		const banEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/hammer_1f528.png',
				name: 'Ban Hammer'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();
		const highestRoleOfCallingMember: Role = msg.member.roles.highest;

		// Check if user is able to ban the mentioned user
		if (!memberToBan.bannable || !(highestRoleOfCallingMember.comparePositionTo(memberToBan.roles.highest) > 0)) {
			return sendSimpleEmbeddedError(msg, `I can't ban <@${memberToBan.id}>. Do they have the same or a higher role than me or you?`, 3000);
		}

		// Ban
		memberToBan.ban({ reason: `Banned by: ${msg.author} for: ${reason}` })
			.catch((err: Error) => this.catchError(msg, { member, reason }, err));

		// Set up embed message
		banEmbed.setDescription(stripIndents`
			**Moderator:** ${msg.author.tag} (${msg.author.id})
			**Member:** ${member.user.tag} (${member.id})
			**Action:** Ban
			**Reason:** ${reason}`);

		modLogMessage(msg, banEmbed);

		// Send the success response
		return msg.sendEmbed(banEmbed);
	}

	private catchError(msg: KlasaMessage, args: { member: GuildMember, reason: string }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
			Error occurred in \`ban\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`${args.member.user.tag} (${args.member.id})\` || \`${args.reason}\`
			**Error Message:** ${err}
		`);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, `Banning ${args.member} for ${args.reason} failed!`, 3000);
	}
}
