import { stripIndents } from 'common-tags';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { sendSimpleEmbeddedError, getEmbedColor } from '../../lib/helpers';
import * as format from 'date-fns/format';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Clears warns for a member of the guild.
 *
 * @export
 * @class ClearWarnsCommand
 * @extends {Command}
 */
export default class ClearWarnsCommand extends Command {
	/**
	 * Creates an instance of ClearWarnsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ClearWarnsCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: [
				'clear-warn',
				'warn-clear'
			],
			description: 'Clear warnings for the specified member.',
			name: 'clear-warns',
			permissionLevel: 3, // KICK_MEMBERS
			usage: '<member:member> [reason:...string]'
		});
	}

	/**
	 * Run the "clear-warns" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ member: GuildMember, reason: string }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof ClearWarnsCommand
	 */
	public async run(msg: KlasaMessage, [member, reason]): Promise<Message | Message[] | any> {
		const warnEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/warning-sign_26a0.png',
				name: 'Clear Warnings'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();
		let previousPoints = 0;
		const guildWarnings = await msg.guild.settings.get('warnings');

		if (guildWarnings.length) {
			// Warnings present for current guild
			try {
				let memberIndex: number = null;
				// Check for previous warnings of supplied member
				const currentWarnings = guildWarnings.find((warning, index) => {
					if (warning.id === member.id) {
						memberIndex = index;

						return true
					}

					return false;
				});

				if (currentWarnings && memberIndex !== null) {
					// Previous warnings present for supplied member
					previousPoints = currentWarnings.points;

					msg.guild.settings.update('warnings', currentWarnings, null, { arrayPosition: memberIndex });
					// Set up embed message
					warnEmbed.setDescription(stripIndents`
						**Moderator:** ${msg.author.tag} (${msg.author.id})
						**Member:** ${member.user.tag} (${member.id})
						**Action:** Clear Warns
						**Previous Warning Points:** ${previousPoints}
						**Current Warning Points:** 0
						**Reason:** ${reason ? reason : 'No reason has been added by the moderator'}`);

					// Send the success response
					return msg.sendEmbed(warnEmbed);
				} else {
					// No previous warnings present
					return sendSimpleEmbeddedError(msg, 'No warnings present for the supplied member.');
				}
			} catch (err) {
				this.catchError(msg, { member: member, reason: reason }, err);
			}
		} else {
			// No warnings for current guild
			return sendSimpleEmbeddedError(msg, 'No warnings for current guild', 3000);
		}
	}

	private catchError(msg: KlasaMessage, args: { member: GuildMember, reason: string }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
		Error occurred in \`clear-warns\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		**Input:** \`${args.member.user.tag} (${args.member.id})\` || \`${args.reason}\`
		**Error Message:** ${err}`);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, `Clearing warnings for ${args.member} failed!`, 3000);
	}
}