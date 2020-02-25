/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, Duration, KlasaMessage, Timestamp } from 'klasa';
import { MessageEmbed, Permissions } from 'discord.js';
import { getEmbedColor, sendSimpleEmbeddedError, modLogMessage } from '@lib/helpers';
import { stripIndents } from 'common-tags';

export default class MuteCommand extends Command {
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Mutes a mentioned member.',
			permissionLevel: 6, // MANAGE_GUILD
			requiredPermissions: Permissions.FLAGS.MANAGE_ROLES,
			requiredSettings: ['roles.muted'],
			usage: '[when:time] <member:member> [reason:...string]'
		});
	}

	public async run(msg: KlasaMessage, [when, member, reason]): Promise<KlasaMessage | KlasaMessage[]> {
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
			return sendSimpleEmbeddedError(msg, 'You cannot mute this user. Do they have the same or higher role than you?', 3000);
		}
		// Check if the mentioned user is already muted
		if (member.roles.has(msg.guild.settings.get('roles.muted'))) {
			return sendSimpleEmbeddedError(msg, 'The member is already muted.', 3000);
		}

		try {
			await member.roles.add(msg.guild.settings.get('roles.muted'));
			if (when) {
				await this.client.schedule.create('unmute', when, {
					data: {
						guild: msg.guild.id,
						user: member.id
					}
				});
				// Set up embed message
				muteEmbed.setDescription(stripIndents`
					**Moderator:** ${msg.author.tag} (${msg.author.id})
					**Member:** ${member.user.tag} (${member.id})
					**Action:** Mute
					**Duration:** ${Duration.toNow(when)}
					**Reason:** ${reason ? reason : 'no reason'}
				`);

				modLogMessage(msg, muteEmbed);

				// Send the success response
				return msg.sendEmbed(muteEmbed);
			}

			return msg.sendMessage(`${member.user.tag} was muted.${reason ? ` With reason of: ${reason}` : ''}`);
		} catch (err) {
			// Emit warn event for debugging
			msg.client.emit('warn', stripIndents`
			Error occurred in \`mute\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
			**Input:** \`${member.user.tag} (${member.id})\` || \`${reason}\`
			**Error Message:** ${err}`);

			// Inform the user the command failed
			return sendSimpleEmbeddedError(msg, `Muting ${member} for ${reason ? reason : 'no reason'} failed!`, 3000);
		}
	}

};
