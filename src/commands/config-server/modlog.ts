/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, Channel } from 'discord.js';
import { Command, CommandStore, KlasaMessage, Possible, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';
import { resolveChannel } from '@lib/helpers/base';
import { modLogMessage } from '@lib/helpers/custom-helpers';

/**
 * Enable or disable the Modlog feature.
 *
 * @export
 * @class ModlogCommand
 * @extends {Command}
 */
export default class ModlogCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Enable or disable the modlog feature.',
			extendedHelp: stripIndents`
				**Subcommand Usage**:
				\`status\` - return the mod log configuration details.
				\`channel <#channelMention>\` - set mod log channel to the channel supplied.
				\`on\` - enable the mod log feature.
				\`off\` - disable the mod log feature.
			`,
			name: 'modlog',
			permissionLevel: 6, // MANAGE_GUILD
			subcommands: true,
			usage: '<on|off|status|channel> (channel:channel)'
		});

		this.createCustomResolver('channel', (arg: string, possible: Possible, message: KlasaMessage, [subCommand]: [string]) => {
			if (subCommand === 'channel' && (!arg || !message.guild.channels.get(resolveChannel(arg)))) throw new Error('Please provide a channel for the modlog messages to be displayed in.');

			return resolveChannel(arg);
		});
	}

	public async on(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const modlogEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Modlog);
		const modlogChannel = msg.guild.settings.get(GuildSettings.Modlog.Channel);
		const modlogEnabled = msg.guild.settings.get(GuildSettings.Modlog.Enabled);

		if (modlogChannel) {
			if (modlogEnabled) {
				return msg.sendSimpleEmbed('Modlog feature already enabled!', 3000);
			}
			try {
				await msg.guild.settings.update(GuildSettings.Modlog.Enabled, true);

				// Set up embed message
				modlogEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Modlog set to: _Enabled_
							`);
				modlogEmbed.setFooter('Use the `modlog status` command to see the details of this feature');

				return this.sendSuccess(msg, modlogEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'enable' }, err);
			}

		} else {
			return msg.sendSimpleError('Please set the channel for the modlog before enabling the feature. See `!help modlog` for info.', 3000);
		}
	}

	public async off(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const modlogEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Modlog);
		const modlogEnabled = msg.guild.settings.get(GuildSettings.Modlog.Enabled);

		if (modlogEnabled) {
			try {
				await msg.guild.settings.update('modlog.enabled', false);

				// Set up embed message
				modlogEmbed.setDescription(stripIndents`
							**Member:** ${msg.author.tag} (${msg.author.id})
							**Action:** Modlog set to: _Disabled_
						`);
				modlogEmbed.setFooter('Use the `modlog status` command to see the details of this feature');

				return this.sendSuccess(msg, modlogEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'disable' }, err);
			}
		} else {
			return msg.sendSimpleEmbed('Modlog feature already disabled!', 3000);
		}
	}

	public async channel(msg: KlasaMessage, [channel]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const modlogEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Modlog);
		const modlogChannel = msg.guild.settings.get(GuildSettings.Modlog.Channel);

		if (channel) {
			const channelID = msg.guild.channels.get(channel).id;

			if (modlogChannel && modlogChannel === channelID) {
				return msg.sendSimpleEmbed(`Modlog channel already set to <#${channelID}>!`, 3000);
			}
			try {
				await msg.guild.settings.update(GuildSettings.Modlog.Channel, channelID);

				// Set up embed message
				modlogEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Modlog Channel set to <#${channelID}>
							`);
				modlogEmbed.setFooter('Use the `modlog status` command to see the details of this feature');

				return this.sendSuccess(msg, modlogEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'channel', channel }, err);
			}

		} else {
			return msg.sendSimpleError('Invalid channel provided.', 3000);
		}
	}

	/**
	 * Run the "Modlog" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ subCommand: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ModlogCommand
	 */
	public async status(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const modlogEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Modlog);
		const modlogChannel = msg.guild.settings.get(GuildSettings.Modlog.Channel);
		const modlogEnabled = msg.guild.settings.get(GuildSettings.Modlog.Enabled);

		// Set up embed message
		modlogEmbed.setDescription(stripIndents`Modlog feature: ${modlogEnabled ? '_Enabled_' : '_Disabled_'}
										Channel set to: <#${modlogChannel}>`);

		// Send the success response
		return msg.sendEmbed(modlogEmbed);
	}

	private catchError(msg: KlasaMessage, args: { subCommand: string; channel?: Channel|string }, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Build warning message
		let modlogWarn = stripIndents`
			Error occurred in \`accept\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
			**Input:** \`Modlog ${args.subCommand.toLowerCase()} ${`| channel:${args.channel}`}\`
		`;
		let modlogUserWarn = '';

		switch (args.subCommand.toLowerCase()) {
			case 'enable': {
				modlogUserWarn = 'Enabling modlog feature failed!';
				break;
			}
			case 'disable': {
				modlogUserWarn = 'Disabling modlog feature failed!';
				break;
			}
			case 'channel': {
				modlogWarn += stripIndents`
					**Channel:** ${args.channel}`;
				modlogUserWarn = 'Failed setting new modlog channel!';
				break;
			}
		}
		modlogWarn += stripIndents`
			**Error Message:** ${err}`;

		// Emit warn event for debugging
		msg.client.emit('warn', modlogWarn);

		// Inform the user the command failed
		return msg.sendSimpleError(modlogUserWarn);
	}

	private async sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		await modLogMessage(msg, embed);

		// Send the success response
		return msg.sendEmbed(embed);
	}

}
