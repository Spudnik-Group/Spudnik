import { stripIndents } from 'common-tags';
import { Message, MessageEmbed, User } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, stopTyping } from '../../lib/helpers';
import * as format from 'date-fns/format';

/**
 * Unban a member.
 *
 * @export
 * @class UnBanCommand
 * @extends {Command}
 */
export default class UnBanCommand extends Command {
	/**
	 * Creates an instance of UnBanCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof UnBanCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'user',
					prompt: 'Who begged for forgiveness?',
					type: 'user'
				},
				{
					key: 'reason',
					prompt: 'Why do you want to unban this noob?',
					type: 'string'
				}
			],
			clientPermissions: ['BAN_MEMBERS'],
			description: 'Un-Bans the user.',
			details: stripIndents`
				syntax: \`!unban <@userMention | id> <reason>\`

				BAN_MEMBERS permission required.
			`,
			examples: [
				'!unban @user idk why I banned them'
			],
			group: 'mod',
			guildOnly: true,
			memberName: 'unban',
			name: 'unban',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['BAN_MEMBERS']
		});
	}

	/**
	 * Run the "unban" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ user: GuildMember, reason: string }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof UnBanCommand
	 */
	public async run(msg: CommandoMessage, args: { user: User, reason: string }): Promise<Message | Message[]> {
		const unbanEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/hammer_1f528.png',
				name: 'Un-Ban'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		startTyping(msg);

		await msg.guild.members.unban(args.user, `Un-Banned by: ${msg.author} for: ${args.reason}`)
			.catch((err: Error) => this.catchError(msg, args, err));

		// Set up embed message
		unbanEmbed.setDescription(stripIndents`
			**Moderator:** ${msg.author.tag} (${msg.author.id})
			**User:** ${args.user.tag} (${args.user.id})
			**Action:** UnBan
			**Reason:** ${args.reason}`);
		
		modLogMessage(msg, unbanEmbed);
		deleteCommandMessages(msg);
		stopTyping(msg);

		// Send the success response
		return msg.embed(unbanEmbed);
	}

	private catchError(msg: CommandoMessage, args: { user: User, reason: string }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
		Error occurred in \`unban\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		**Input:** \`${args.user.tag} (${args.user.id})\` || \`${args.reason}\`
		**Error Message:** ${err}`);

		// Inform the user the command failed
		stopTyping(msg);

		return sendSimpleEmbeddedError(msg, `Unbanning ${args.user} for ${args.reason} failed!`, 3000);
	}
}
