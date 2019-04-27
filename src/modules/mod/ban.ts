import { stripIndents } from 'common-tags';
import { GuildMember, Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, stopTyping } from '../../lib/helpers';
import * as format from 'date-fns/format';

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
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'member',
					prompt: 'Who needs the banhammer?',
					type: 'member'
				},
				{
					key: 'reason',
					prompt: 'Why do you want to ban this noob?',
					type: 'string'
				},
				{
					default: 0,
					key: 'daysOfMessages',
					prompt: 'How many days worth of messages would you like to delete?',
					type: 'integer'
				}
			],
			clientPermissions: ['BAN_MEMBERS'],
			description: 'Bans the user, optionally deleting messages from them in the last x days.',
			details: stripIndents`
				syntax: \`!ban <@userMention> <reason> (daysOfMessages)\`

				BAN_MEMBERS permission required.
			`,
			examples: [
				'!ban @user being a pleb',
				'!ban @user being a pleb 7'
			],
			group: 'mod',
			guildOnly: true,
			memberName: 'ban',
			name: 'ban',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['BAN_MEMBERS']
		});
	}

	/**
	 * Run the "ban" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ member: GuildMember, reason: string, daysOfMessages: number }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof BanCommand
	 */
	public async run(msg: CommandoMessage, args: { member: GuildMember, reason: string, daysOfMessages: number }): Promise<Message | Message[]> {
		const memberToBan: GuildMember = args.member;
		const banEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/hammer_1f528.png',
				name: 'Ban Hammer'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();
		const highestRoleOfCallingMember: Role = msg.member.roles.highest;

		startTyping(msg);

		// Check if user is able to ban the mentioned user
		if (!memberToBan.bannable || !(highestRoleOfCallingMember.comparePositionTo(memberToBan.roles.highest) > 0)) {
			deleteCommandMessages(msg);
			stopTyping(msg);

			return sendSimpleEmbeddedError(msg, `I can't ban <@${memberToBan.id}>. Do they have the same or a higher role than me or you?`, 3000);
		}

		if (args.daysOfMessages) {
			// Ban and delete messages
			memberToBan.ban({ days: args.daysOfMessages, reason: `Banned by: ${msg.author} for: ${args.reason}` })
				.catch((err: Error) => this.catchError(msg, args, err));
		} else {
			// Ban
			memberToBan.ban({ reason: `Banned by: ${msg.author} for: ${args.reason}` })
				.catch((err: Error) => this.catchError(msg, args, err));
		}

		// Set up embed message
		banEmbed.setDescription(stripIndents`
			**Moderator:** ${msg.author.tag} (${msg.author.id})
			**Member:** ${args.member.user.tag} (${args.member.id})
			**Action:** Ban
			**Reason:** ${args.reason}`);
		
		modLogMessage(msg, banEmbed);
		deleteCommandMessages(msg);
		stopTyping(msg);

		// Send the success response
		return msg.embed(banEmbed);
	}

	private catchError(msg: CommandoMessage, args: { member: GuildMember, reason: string, daysOfMessages: number }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
		Error occurred in \`ban\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		**Input:** \`${args.member.user.tag} (${args.member.id})\` || \`${args.reason}\`
		**Error Message:** ${err}`);

		// Inform the user the command failed
		stopTyping(msg);

		return sendSimpleEmbeddedError(msg, `Banning ${args.member} for ${args.reason} failed!`, 3000);
	}
}
