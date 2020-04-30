/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { Channel, MessageEmbed, Permissions } from 'discord.js';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { Command, CommandStore, KlasaMessage, Possible, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { resolveChannel } from '@lib/helpers/base';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';

/**
 * Adjusts starboard settings.
 *
 * @export
 * @class StarboardCommand
 * @extends {Command}
 */
export default class StarboardCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Used to configure the :star: Star Board feature.',
			extendedHelp: stripIndents`
				**Subcommand Usage**:
				\`status\` - returns the star board configuration details.
				\`channel <#channelMention>\` - sets star board channel to the channel supplied.
				\`trigger <emoji>\` - sets emoji to save to star board.
				\`on\` - enable the star board feature.
				\`off\` - disable the star board feature.
			`,
			name: 'starboard',
			permissionLevel: 6, // MANAGE_GUILD
			requiredPermissions: [Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.READ_MESSAGE_HISTORY, Permissions.FLAGS.ATTACH_FILES, Permissions.FLAGS.MANAGE_MESSAGES],
			subcommands: true,
			usage: '<on|off|status|channel|trigger> (content:content)'
		});

		this.createCustomResolver('content', (arg: string, possible: Possible, message: KlasaMessage, [subCommand]: [string]) => {
			const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

			if (subCommand === 'channel' && (!arg || !message.guild.channels.get(resolveChannel(arg)))) throw new Error('Please provide a channel for the starboard messages to be displayed in.');
			if (subCommand === 'trigger' && (!arg || !arg.match(emojiRegex))) throw new Error('Please include the new emoji trigger for the starboard feature.');

			return arg;
		});
	}

	/**
	 * Change the channel the starred message is saved to
	 *
	 * @param {KlasaMessage} msg
	 * @param {Channel} content
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof StarboardCommand
	 */
	public async channel(msg: KlasaMessage, [content]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const starboardEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Starboard);
		const starboard = msg.guild.settings.get(GuildSettings.Starboard.Channel);
		const channelID = msg.guild.channels.get(resolveChannel(content)).id;

		if (starboard && starboard === channelID) {
			return msg.sendSimpleEmbed(`Star Board channel already set to <#${channelID}>!`, 3000);
		}
		try {
			await msg.guild.settings.update(GuildSettings.Starboard.Channel, channelID);

			// Set up embed message
			starboardEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Star Board Channel set to <#${channelID}>
				`);
			starboardEmbed.setFooter('Use the `starboard status` command to see the details of this feature');

			return this.sendSuccess(msg, starboardEmbed);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'channel', content }, err);
		}

	}

	/**
	 * Change the emoji that triggers saving a message to the starboard.
	 *
	 * @param {KlasaMessage} msg
	 * @param {Channel} content
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof StarboardCommand
	 */
	public async trigger(msg: KlasaMessage, [content]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const starboardEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Starboard);

		try {
			await msg.guild.settings.update(GuildSettings.Starboard.Trigger, content);

			// Set up embed message
			starboardEmbed.setDescription(stripIndents`
				**Member:** ${msg.author.tag} (${msg.author.id})
				**Action:** Star Board trigger set to: ${content}
			`);
			starboardEmbed.setFooter('Use the `starboard status` command to see the details of this feature');

			return this.sendSuccess(msg, starboardEmbed);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'trigger', content }, err);
		}
	}

	/**
	 * Turn the feature on
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof StarboardCommand
	 */
	public async on(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const starboardEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Starboard);
		const starboard = msg.guild.settings.get(GuildSettings.Starboard.Channel);
		const starboardEnabled = msg.guild.settings.get(GuildSettings.Starboard.Enabled);

		if (starboard) {
			if (starboardEnabled) {
				return msg.sendSimpleEmbed('Star Board already enabled!', 3000);
			}
			try {
				await msg.guild.settings.update(GuildSettings.Starboard.Enabled, true);

				// Set up embed message
				starboardEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Star Board set to: _Enabled_
					`);
				starboardEmbed.setFooter('Use the `starboard status` command to see the details of this feature');

				return this.sendSuccess(msg, starboardEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'enable' }, err);
			}

		} else {
			return msg.sendSimpleError('Please set the channel for the Star Board before enabling the feature. See `!help starboard` for info.', 3000);
		}
	}

	/**
	 * Turn the feature off
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof StarboardCommand
	 */
	public async off(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const starboardEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Starboard);
		const starboardEnabled: boolean = msg.guild.settings.get(GuildSettings.Starboard.Enabled);

		if (starboardEnabled) {
			try {
				await msg.guild.settings.update(GuildSettings.Starboard.Enabled, false);

				// Set up embed message
				starboardEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Star Board set to: _Disabled_
				`);
				starboardEmbed.setFooter('Use the `starboard status` command to see the details of this feature');

				return this.sendSuccess(msg, starboardEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'disable' }, err);
			}
		} else {
			return msg.sendSimpleEmbed('Star Board already disabled!', 3000);
		}
	}

	/**
	 * Return the status of the feature
	 *
	 * @param {KlasaMessage} msg
	 * @param {Channel | string } content
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof StarboardCommand
	 */
	public async status(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const starboardEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Starboard);
		const starboard = msg.guild.settings.get(GuildSettings.Starboard.Channel);
		const starboardTrigger: string = msg.guild.settings.get(GuildSettings.Starboard.Trigger);
		const starboardEnabled: boolean = msg.guild.settings.get(GuildSettings.Starboard.Enabled);

		// Set up embed message
		starboardEmbed.setDescription(stripIndents`Star Board feature: ${starboardEnabled ? '_Enabled_' : '_Disabled_'}
			Channel set to: <#${starboard}>
			Reaction Trigger set to: ${starboardTrigger}
		`);

		// Send the success response
		return msg.sendEmbed(starboardEmbed);
	}

	/**
	 * Handle errors in the command's execution
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ subCommand: string, content?: Channel | string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof StarboardCommand
	 */
	private catchError(msg: KlasaMessage, args: { subCommand: string; content?: Channel | string }, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Build warning message
		let starboardWarn = stripIndents`
		Error occurred in \`starboard\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
		**Input:** \`Starboard ${args.subCommand.toLowerCase()}\``;
		let starboardUserWarn = '';
		switch (args.subCommand.toLowerCase()) {
			case 'enable': {
				starboardUserWarn = 'Enabling Star Board feature failed!';
				break;
			}
			case 'disable': {
				starboardUserWarn = 'Disabling Star Board feature failed!';
				break;
			}
			case 'trigger': {
				starboardWarn += stripIndents`
					**Trigger:** ${args.content}`;
				starboardUserWarn = 'Failed saving new Star Board trigger!';
				break;
			}
			case 'channel': {
				starboardWarn += stripIndents`
					**Channel:** ${args.content}`;
				starboardUserWarn = 'Failed setting new Star Board channel!';
				break;
			}
		}
		starboardWarn += stripIndents`
			**Error Message:** ${err}`;

		// Emit warn event for debugging
		msg.client.emit('warn', starboardWarn);

		// Inform the user the command failed
		return msg.sendSimpleError(starboardUserWarn);
	}

	private async sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		await modLogMessage(msg, embed);

		// Send the success response
		return msg.sendEmbed(embed);
	}

}
