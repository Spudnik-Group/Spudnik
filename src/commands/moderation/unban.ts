import { stripIndents } from 'common-tags';
import { MessageEmbed, User, Permissions } from 'discord.js';
import { getEmbedColor, modLogMessage, sendSimpleEmbeddedError } from '../../lib/helpers';
import * as format from 'date-fns/format';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Un-Bans the user.',
			name: 'unban',
			permissionLevel: 4, // BAN_MEMBERS
			requiredPermissions: Permissions.FLAGS['BAN_MEMBERS'],
			usage: '<user:user> [reason:...string]'
		});
	}

	/**
	 * Run the "unban" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ user: GuildMember, reason: string }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof UnBanCommand
	 */
	public async run(msg: KlasaMessage, [user, reason]): Promise<KlasaMessage | KlasaMessage[]> {
		const unbanEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/hammer_1f528.png',
				name: 'Un-Ban'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		try {
			await msg.guild.members.unban(user, `Un-Banned by: ${msg.author.tag} (${msg.author.id}) for: ${reason}`);
	
			// Set up embed message
			unbanEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**User:** ${user.tag} (${user.id})
				**Action:** UnBan
				**Reason:** ${reason}`);
	
			modLogMessage(msg, unbanEmbed);
	
			// Send the success response
			return msg.sendEmbed(unbanEmbed);
		} catch (err) {
			this.catchError(msg, { user: user, reason: reason }, err);
		}
	}

	private catchError(msg: KlasaMessage, args: { user: User, reason: string }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
		Error occurred in \`unban\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		**Input:** \`${args.user.tag} (${args.user.id})\` || \`${args.reason}\`
		**Error Message:** ${err}`);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, `Unbanning ${args.user} for ${args.reason} failed!`, 3000);
	}
}
