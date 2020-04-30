/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { Channel, MessageEmbed } from 'discord.js';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { basicFeatureContent } from '@lib/helpers/resolvers';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { resolveChannel } from '@lib/helpers/base';
import { specialEmbed } from '@lib/helpers/embed-helpers';

/**
 * Manage notifications when someone joins the guild.
 *
 * @export
 * @class WelcomeCommand
 * @extends {Command}
 */
export default class WelcomeCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Used to configure the message to be sent when a new user join your guild.',
			extendedHelp: stripIndents`
				**Subcommand Usage**:
				\`status\` - return the welcome feature configuration details.
				\`message (text to welcome/heckle)\` - set the welcome message. Use { guild } for guild name, and { user } to reference the user joining.
				\`channel <#channelMention>\` - set the channel for the welcome message to be displayed.
				\`on\` - enable the welcome message feature.
				\`off\` - disable the welcome message feature.
			`,
			name: 'welcome',
			permissionLevel: 6, // MANAGE_GUILD
			subcommands: true,
			usage: '<message|channel|on|off|status> (content:content)'
		});

		this.createCustomResolver('content', basicFeatureContent);
	}

	/**
	 * Change the message that is sent
	 *
	 * @param {KlasaMessage} msg
	 * @param {string} content
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof WelcomeCommand
	 */
	public async message(msg: KlasaMessage, [content]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const welcomeEmbed = specialEmbed(msg, 'welcome');

		try {
			await msg.guild.settings.update(GuildSettings.Welcome.Message, content);

			// Set up embed message
			welcomeEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Welcome message set to:
						\`\`\`${content}\`\`\`
					`);
			welcomeEmbed.setFooter('Use the `welcome status` command to see the details of this feature');

			return this.sendSuccess(msg, welcomeEmbed);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'message', content }, err);
		}
	}

	/**
	 * Change the channel the welcome message is sent to
	 *
	 * @param {KlasaMessage} msg
	 * @param {Channel} content
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof WelcomeCommand
	 */
	public async channel(msg: KlasaMessage, [content]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const welcomeEmbed = specialEmbed(msg, 'welcome');
		const welcomeChannel = msg.guild.settings.get(GuildSettings.Welcome.Channel);
		const channelID = msg.guild.channels.get(resolveChannel(content)).id;

		if (welcomeChannel && welcomeChannel === channelID) {
			return msg.sendSimpleEmbed(`Welcome channel already set to <#${channelID}>!`, 3000);
		}
		try {
			await msg.guild.settings.update(GuildSettings.Welcome.Channel, channelID);

			// Set up embed message
			welcomeEmbed.setDescription(stripIndents`
							**Member:** ${msg.author.tag} (${msg.author.id})
							**Action:** Welcome Channel set to <#${channelID}>
						`);
			welcomeEmbed.setFooter('Use the `welcome status` command to see the details of this feature');

			return this.sendSuccess(msg, welcomeEmbed);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'channel', content }, err);
		}

	}

	/**
	 * Turn the feature on
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof WelcomeCommand
	 */
	public async on(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const welcomeEmbed = specialEmbed(msg, 'welcome');
		const welcomeChannel = msg.guild.settings.get(GuildSettings.Welcome.Channel);
		const welcomeEnabled = msg.guild.settings.get(GuildSettings.Welcome.Enabled);

		if (welcomeChannel) {
			if (welcomeEnabled) {
				return msg.sendSimpleEmbed('Welcome message already enabled!', 3000);
			}
			try {
				await msg.guild.settings.update(GuildSettings.Welcome.Enabled, true);

				// Set up embed message
				welcomeEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Welcome messages set to: _Enabled_
					`);
				welcomeEmbed.setFooter('Use the `welcome status` command to see the details of this feature');

				return this.sendSuccess(msg, welcomeEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'enable' }, err);
			}

		} else {
			return msg.sendSimpleEmbed('Please set the channel for the welcome message before enabling the feature. See `help welcome` for info.', 3000);
		}
	}

	/**
	 * Turn the feature off
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof WelcomeCommand
	 */
	public async off(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const welcomeEmbed = specialEmbed(msg, 'welcome');
		const welcomeEnabled = msg.guild.settings.get(GuildSettings.Welcome.Enabled);

		if (welcomeEnabled) {
			try {
				await msg.guild.settings.update(GuildSettings.Welcome.Enabled, false);

				// Set up embed message
				welcomeEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Welcome messages set to: _Disabled_
				`);
				welcomeEmbed.setFooter('Use the `welcome status` command to see the details of this feature');

				return this.sendSuccess(msg, welcomeEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'disable' }, err);
			}
		} else {
			return msg.sendSimpleEmbed('Welcome message already disabled!', 3000);
		}
	}

	/**
	 * Return the status of the feature.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof WelcomeCommand
	 */
	public async status(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const welcomeEmbed = specialEmbed(msg, 'welcome');
		const welcomeChannel = msg.guild.settings.get(GuildSettings.Welcome.Channel);
		const welcomeMessage = msg.guild.settings.get(GuildSettings.Welcome.Message);
		const welcomeEnabled = msg.guild.settings.get(GuildSettings.Welcome.Enabled);

		// Set up embed message
		welcomeEmbed.setDescription(stripIndents`
			Welcome feature: ${welcomeEnabled ? '_Enabled_' : '_Disabled_'}
			Channel set to: <#${welcomeChannel}>
			Message set to:
			\`\`\`${welcomeMessage}\`\`\`
		`);

		// Send the success response
		return msg.sendEmbed(welcomeEmbed);
	}

	/**
	 * Handle errors in the command's execution
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ subCommand: string, content?: Channel | string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof WelcomeCommand
	 */
	private catchError(msg: KlasaMessage, args: { subCommand: string; content?: Channel | string }, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Build warning message
		let welcomeWarn = stripIndents`
		Error occurred in \`welcome\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
		**Input:** \`Welcome ${args.subCommand.toLowerCase()}\``;
		let welcomeUserWarn = '';

		switch (args.subCommand.toLowerCase()) {
			case 'on': {
				welcomeUserWarn = 'Enabling welcome feature failed!';
				break;
			}
			case 'off': {
				welcomeUserWarn = 'Disabling welcome feature failed!';
				break;
			}
			case 'message': {
				welcomeWarn += stripIndents`
					**Message:** ${args.content}`;
				welcomeUserWarn = 'Failed saving new welcome message!';
				break;
			}
			case 'channel': {
				welcomeWarn += stripIndents`
					**Channel:** ${args.content}`;
				welcomeUserWarn = 'Failed setting new welcome channel!';
				break;
			}
		}
		welcomeWarn += stripIndents`
			**Error Message:** ${err}`;

		// Emit warn event for debugging
		msg.client.emit('warn', welcomeWarn);

		// Inform the user the command failed
		return msg.sendSimpleError(welcomeUserWarn);
	}

	private async sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		await modLogMessage(msg, embed);

		// Send the success response
		return msg.sendEmbed(embed);
	}

}
