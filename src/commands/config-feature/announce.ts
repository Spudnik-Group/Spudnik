/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { Channel, TextChannel } from 'discord.js';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { Command, CommandStore, KlasaMessage, Timestamp, Possible } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { resolveChannel } from '@lib/helpers/base';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';

/**
 * Have the bot post an announcement to a pre-configured or specified channel.
 *
 * @export
 * @class AnnounceCommand
 * @extends {Command}
 */
export default class AnnounceCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Have the bot post an announcement to a pre-configured or specified channel.',
			extendedHelp: stripIndents`
				Supplying no channel clears the announcement channel.
			`,
			name: 'announce',
			permissionLevel: 6, // MANAGE_GUILD
			subcommands: true,
			usage: '<channel|send|direct> <content:content> [text:...string]'
		});

		this.createCustomResolver('content', (arg: string, possible: Possible, message: KlasaMessage, [subCommand]: [string]) => {
			if (subCommand === 'channel' && (!arg || !message.guild.channels.get(resolveChannel(arg)))) throw 'Please provide a valid channel for the announcements to be displayed in.';
			if (subCommand === 'send' && !arg) throw 'Please include the text for the announcement.';
			if (subCommand === 'direct' && (!arg || !message.guild.channels.get(resolveChannel(arg)))) throw 'Please provide a valid channel for the announcement to be displayed in.';

			return arg;
		});
	}

	/**
	 * Send an announcement to the specified channel
	 *
	 * @param {KlasaMessage} msg
	 * @param {string} content
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof AnnounceCommand
	 */
	public async direct(msg: KlasaMessage, [channel, text]: Array<string>): Promise<KlasaMessage | KlasaMessage[]> {
		if (!text) throw 'Please include the text for the announcement.';
		const announceEmbed = specialEmbed(msg, specialEmbedTypes.Announcement);
		const modlogEmbed = specialEmbed(msg, specialEmbedTypes.Announcement);
		const announceChannel = (msg.guild.channels.get(resolveChannel(channel)) as TextChannel);

		try {
			// Set up embed message
			announceEmbed.setDescription(text);

			// Send the success announcement
			await announceChannel.sendEmbed(announceEmbed).then((announcement: KlasaMessage) => {
				modlogEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Announcement made to ${announceChannel}.
					**Link:** [Jump](${announcement.url})
				`);
			});

			// Log the action
			await modLogMessage(msg, modlogEmbed);

			// Tell the user the action was a success
			return msg.sendSimpleSuccess('Sent Announcement Successfully', 3000);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'direct', content: channel }, err);
		}
	}

	/**
	 * Change the channel the annoucements are displayed in
	 *
	 * @param {KlasaMessage} msg
	 * @param {Channel} content
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof AnnounceCommand
	 */
	public async channel(msg: KlasaMessage, [channel]: string): Promise<KlasaMessage | KlasaMessage[]> {
		const announceEmbed = specialEmbed(msg, specialEmbedTypes.Announcement);
		const announceChannel = msg.guild.settings.get(GuildSettings.Announce.Channel);
		const channelID = msg.guild.channels.get(resolveChannel(channel)).id;

		if (announceChannel && announceChannel === channelID) {
			return msg.sendSimpleEmbed(`Announcement channel already set to <#${channelID}>!`, 3000);
		}
		try {
			await msg.guild.settings.update(GuildSettings.Announce.Channel, channelID);

			// Set up embed message
			announceEmbed.setDescription(stripIndents`
				**Member:** ${msg.author.tag} (${msg.author.id})
				**Action:** Announcement Channel set to <#${channelID}>
			`);
			await modLogMessage(msg, announceEmbed);

			return msg.sendEmbed(announceEmbed);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'channel', content: channel }, err);
		}

	}

	/**
	 * Sends an announcement to the announcement channel
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof AnnounceCommand
	 */
	public async send(msg: KlasaMessage, [text]: string): Promise<KlasaMessage | KlasaMessage[]> {
		const announceEmbed = specialEmbed(msg, specialEmbedTypes.Announcement);
		const modlogEmbed = specialEmbed(msg, specialEmbedTypes.Announcement);
		const announceChannel = (msg.guild.channels.get(msg.guild.settings.get(GuildSettings.Announce.Channel)) as TextChannel);

		if (announceChannel) {
			try {
				// Set up embed message
				announceEmbed.setDescription(text);

				// Send the success announcement
				await announceChannel.sendEmbed(announceEmbed).then((announcement: KlasaMessage) => {
					modlogEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Announcement made to ${announceChannel}.
						**Link:** [Jump](${announcement.url})
					`);
				});

				// Log the action
				await modLogMessage(msg, modlogEmbed);

				// Tell the user the action was a success
				return msg.sendSimpleSuccess('Sent Announcement Successfully', 3000);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'send' }, err);
			}

		} else {
			return msg.sendSimpleError('Please set the channel for the goodbye message before enabling the feature. See `help goodbye` for info.', 3000);
		}
	}

	/**
	 * Handle errors in the command's execution
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ subCommand: string, content?: Channel | string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof AnnounceCommand
	 */
	private catchError(msg: KlasaMessage, args: { subCommand: string; content?: Channel | string }, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Build warning message
		let goodbyeWarn = stripIndents`
			Error occurred in \`announce\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
			**Input:** \`Announce ${args.subCommand.toLowerCase()}\`
		`;
		let goodbyeUserWarn = '';

		switch (args.subCommand.toLowerCase()) {
			case 'on': {
				goodbyeUserWarn = 'Enabling goodbye feature failed!';
				break;
			}
			case 'off': {
				goodbyeUserWarn = 'Disabling goodbye feature failed!';
				break;
			}
			case 'message': {
				goodbyeWarn += stripIndents`
					**Message:** ${args.content}`;
				goodbyeUserWarn = 'Failed saving new goodbye message!';
				break;
			}
			case 'channel': {
				goodbyeWarn += stripIndents`
					**Channel:** ${args.content}`;
				goodbyeUserWarn = 'Failed setting new goodbye channel!';
				break;
			}
		}
		goodbyeWarn += stripIndents`
			**Error Message:** ${err}`;

		// Emit warn event for debugging
		msg.client.emit('warn', goodbyeWarn);

		// Inform the user the command failed
		return msg.sendSimpleError(goodbyeUserWarn);
	}

}
