/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed } from 'discord.js';
import { sendSimpleEmbeddedError, getEmbedColor } from '../../lib/helpers';
import * as format from 'date-fns/format';
import { KlasaClient, CommandStore, Command, KlasaMessage } from 'klasa';

/**
 * Warn a member of the guild.
 *
 * @export
 * @class WarnCommand
 * @extends {Command}
 */
export default class WarnCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Warn a member with a specified amount of points',
			name: 'warn',
			permissionLevel: 1, // MANAGE_MESSAGES
			usage: '<member:member> <points:int> [reason:...string]'
		});
	}

	/**
	 * Run the "Warn" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ member: GuildMember, points: number, reason: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof WarnCommand
	 */
	public async run(msg: KlasaMessage, [member, points, reason]): Promise<KlasaMessage | KlasaMessage[]> {
		const warnEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/warning-sign_26a0.png',
				name: 'Warning'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();
		let previousPoints = 0;
		const guildWarnings = await msg.guild.settings.get('warnings');

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
				const newPoints = previousPoints + points;
				// Update previous warning points
				msg.guild.settings.update('warnings', { id: member.id, points: newPoints }, null, { arrayPosition: memberIndex });
				// Set up embed message
				warnEmbed.setDescription(stripIndents`
					**Moderator:** ${msg.author.tag} (${msg.author.id})
					**Member:** ${member.user.tag} (${member.id})
					**Action:** Warn
					**Previous Warning Points:** ${previousPoints}
					**Current Warning Points:** ${newPoints}
					**Reason:** ${reason ? reason : 'No reason has been added by the moderator'}`);

				// Send the success response
				return msg.sendEmbed(warnEmbed);
			} else {
				// No previous warnings present
				msg.guild.settings.update('warnings', { id: member.id, points: points }, null, { action: 'add' });
				// Set up embed message
				warnEmbed.setDescription(stripIndents`
					**Moderator:** ${msg.author.tag} (${msg.author.id})
					**Member:** ${member.user.tag} (${member.id})
					**Action:** Warn
					**Previous Warning Points:** 0
					**Current Warning Points:** ${points}
					**Reason:** ${reason ? reason : 'No reason has been added by the moderator'}`);

				// Send the success response
				return msg.sendEmbed(warnEmbed);
			}
		} catch (err) {
			this.catchError(msg, { member: member, points: points, reason: reason }, err);
		}
	}

	private catchError(msg: KlasaMessage, args: { member: GuildMember, points: number, reason: string }, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
		Error occurred in \`warn\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		**Input:** \`${args.member.user.tag} (${args.member.id})\`|| \`${args.points}\` || \`${args.reason}\`
		**Error Message:** ${err}`);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, `Warning ${args.member} failed!`, 3000);
	}
}
