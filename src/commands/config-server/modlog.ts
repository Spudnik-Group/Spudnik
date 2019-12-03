import { stripIndents } from 'common-tags';
import { MessageEmbed, Channel } from 'discord.js';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, getEmbedColor, modLogMessage } from '../../lib/helpers';
import * as format from 'date-fns/format';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Enable or disable the Modlog feature.
 *
 * @export
 * @class ModlogCommand
 * @extends {Command}
 */
export default class ModlogCommand extends Command {

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
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
	}

	public async on(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const modlogEmbed: MessageEmbed = new MessageEmbed({
			author: {
				iconURL: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/memo_1f4dd.png',
				name: 'Mod Log'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();
		const modlogChannel = await msg.guild.settings.get('modlogChannel');
		const modlogEnabled = await msg.guild.settings.get('modlogEnabled');
		if (modlogChannel) {
			if (modlogEnabled) {
				return sendSimpleEmbeddedMessage(msg, 'Modlog feature already enabled!', 3000);
			} else {
				try {
					await msg.guild.settings.update('modlogEnabled', true);
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
			}
		} else {
			return sendSimpleEmbeddedError(msg, 'Please set the channel for the modlog before enabling the feature. See `!help modlog` for info.', 3000);
		}
	}

	public async off(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const modlogEmbed: MessageEmbed = new MessageEmbed({
			author: {
				iconURL: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/memo_1f4dd.png',
				name: 'Mod Log'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();
		const modlogEnabled = await msg.guild.settings.get('modlogEnabled');
		if (modlogEnabled) {
			try {
				await msg.guild.settings.update('modlogEnabled', false);
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
			return sendSimpleEmbeddedMessage(msg, 'Modlog feature already disabled!', 3000);
		}
	}

	public async channel(msg: KlasaMessage, [channel]): Promise<KlasaMessage | KlasaMessage[]> {
		const modlogEmbed: MessageEmbed = new MessageEmbed({
			author: {
				iconURL: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/memo_1f4dd.png',
				name: 'Mod Log'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();
		const modlogChannel = await msg.guild.settings.get('modlogChannel');
		if (channel instanceof Channel) {
			const channelID = (channel as Channel).id;

			if (modlogChannel && modlogChannel === channelID) {
				return sendSimpleEmbeddedMessage(msg, `Modlog channel already set to <#${channelID}>!`, 3000);
			} else {
				try {
					await msg.guild.settings.update('modlogChannel', channelID);
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
			}
		} else {
			return sendSimpleEmbeddedError(msg, 'Invalid channel provided.', 3000);
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
		const modlogEmbed: MessageEmbed = new MessageEmbed({
			author: {
				iconURL: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/memo_1f4dd.png',
				name: 'Mod Log'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();
		const modlogChannel = await msg.guild.settings.get('modlogChannel');
		const modlogEnabled = await msg.guild.settings.get('modlogEnabled');
		// Set up embed message
		modlogEmbed.setDescription(stripIndents`Modlog feature: ${modlogEnabled ? '_Enabled_' : '_Disabled_'}
										Channel set to: <#${modlogChannel}>`);

		// Send the success response
		return msg.sendEmbed(modlogEmbed);
	}

	private catchError(msg: KlasaMessage, args: { subCommand: string, channel?: Channel }, err: Error) {
		// Build warning message
		let modlogWarn = stripIndents`
			Error occurred in \`accept\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`Modlog ${args.subCommand.toLowerCase()} ${'| channel:' + args.channel}\`
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
		return sendSimpleEmbeddedError(msg, modlogUserWarn);
	}

	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		modLogMessage(msg, embed);

		// Send the success response
		return msg.sendEmbed(embed);
	}
}
