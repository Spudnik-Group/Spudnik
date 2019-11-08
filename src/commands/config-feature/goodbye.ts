import { stripIndents } from 'common-tags';
import { Channel, MessageEmbed } from 'discord.js';
import { getEmbedColor, modLogMessage, sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';
import * as format from 'date-fns/format';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Manage notifications when someone leaves the guild.
 *
 * @export
 * @class GoodbyeCommand
 * @extends {Command}
 */
export default class GoodbyeCommand extends Command {

	/**
	 * Creates an instance of GoodbyeCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof GoodbyeCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Used to configure the message to be sent when a user leaves your guild.',
			extendedHelp: stripIndents`
				syntax: \`!goodbye <status|message|channel|on|off> (text | #channelMention)\`

				\`status\` - return the goodbye feature configuration details.
				\`message (text to say goodbye/heckle)\` - set the goodbye message. Use { guild } for guild name, and { user } to reference the user leaving.
				\`channel <#channelMention>\` - set the channel for the goodbye message to be displayed.
				\`on\` - enable the goodbye message feature.
				\`off\` - disable the goodbye message feature.

				\`MANAGE_GUILD\` permission required.
			`,
			name: 'goodbye',
			permissionLevel: 6,
			usage: '<message|channel|on|off|status> (content:channel|...string)'
		});
	}

	/**
	 * Change the message that is sent
	 *
	 * @param {KlasaMessage} msg
	 * @param {string} content
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GoodbyeCommand
	 */
	public async message(msg: KlasaMessage, [content]): Promise<KlasaMessage | KlasaMessage[]> {
		const goodbyeEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
				name: 'Server Goodbye Message'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		if (!content) {
			return sendSimpleEmbeddedMessage(msg, 'You must include the new message along with the `message` command. See `help goodbye` for details.', 3000);
		} else {
			try {
				await msg.guild.settings.update('goodbyeMessage', content);
				// Set up embed message
				goodbyeEmbed.setDescription(stripIndents`
							**Member:** ${msg.author.tag} (${msg.author.id})
							**Action:** Goodbye message set to:
							\`\`\`${content}\`\`\`
						`);
				goodbyeEmbed.setFooter('Use the `goodbye status` command to see the details of this feature');

				return this.sendSuccess(msg, goodbyeEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'message', content }, err)
			}
		}
	}

	/**
	 * Change the channel the goodbye message is sent to
	 *
	 * @param {KlasaMessage} msg
	 * @param {Channel} content
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GoodbyeCommand
	 */
	public async channel(msg: KlasaMessage, [content]): Promise<KlasaMessage | KlasaMessage[]> {
		const goodbyeEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
				name: 'Server Goodbye Message'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const goodbyeChannel = await msg.guild.settings.get('goodbyeChannel');
		if (content instanceof Channel) {
			const channelID = (content as Channel).id;

			if (goodbyeChannel && goodbyeChannel === channelID) {
				return sendSimpleEmbeddedMessage(msg, `Goodbye channel already set to <#${channelID}>!`, 3000);
			} else {
				try {
					await msg.guild.settings.update('goodbyeChannel', channelID);
					// Set up embed message
					goodbyeEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Goodbye Channel set to <#${channelID}>
							`);
					goodbyeEmbed.setFooter('Use the `goodbye status` command to see the details of this feature');

					return this.sendSuccess(msg, goodbyeEmbed);
				} catch (err) {
					return this.catchError(msg, { subCommand: 'channel', content }, err)
				}
			}
		} else {
			return sendSimpleEmbeddedError(msg, 'Invalid channel provided.', 3000);
		}
	}

	/**
	 * Turn the feature on
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GoodbyeCommand
	 */
	public async on(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const goodbyeEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
				name: 'Server Goodbye Message'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const goodbyeChannel = await msg.guild.settings.get('goodbyeChannel');
		const goodbyeEnabled = await msg.guild.settings.get('goodbyeEnabled');
		if (goodbyeChannel) {
			if (goodbyeEnabled) {
				return sendSimpleEmbeddedMessage(msg, 'Goodbye message already enabled!', 3000);
			} else {
				try {
					await msg.guild.settings.update('goodbyeEnabled', true);
					// Set up embed message
					goodbyeEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Goodbye messages set to: _Enabled_
							`);
					goodbyeEmbed.setFooter('Use the `goodbye status` command to see the details of this feature');

					return this.sendSuccess(msg, goodbyeEmbed);
				} catch (err) {
					return this.catchError(msg, { subCommand: 'on' }, err)
				}
			}
		} else {
			return sendSimpleEmbeddedError(msg, 'Please set the channel for the goodbye message before enabling the feature. See `help goodbye` for info.', 3000);
		}
	}

	/**
	 * Turn the feature off
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GoodbyeCommand
	 */
	public async off(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const goodbyeEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
				name: 'Server Goodbye Message'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const goodbyeEnabled = await msg.guild.settings.get('goodbyeEnabled');
		if (goodbyeEnabled) {
			try {
				await msg.guild.settings.update('goodbyeEnabled', false);
				// Set up embed message
				goodbyeEmbed.setDescription(stripIndents`
							**Member:** ${msg.author.tag} (${msg.author.id})
							**Action:** Goodbye messages set to: _Disabled_
						`);
				goodbyeEmbed.setFooter('Use the `goodbye status` command to see the details of this feature');

				return this.sendSuccess(msg, goodbyeEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'off' }, err)
			}
		} else {
			return sendSimpleEmbeddedMessage(msg, 'Goodbye message already disabled!', 3000);
		}
	}

	/**
	 * Return the status of the feature
	 *
	 * @param {KlasaMessage} msg
	 * @param {Channel | string } content
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GoodbyeCommand
	 */
	public async status(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const goodbyeEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
				name: 'Server Goodbye Message'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const goodbyeChannel = await msg.guild.settings.get('goodbyeChannel');
		const goodbyeMessage = await msg.guild.settings.get('goodbyeMessage');
		const goodbyeEnabled = await msg.guild.settings.get('goodbyeEnabled');
		// Set up embed message
		goodbyeEmbed.setDescription(stripIndents`
					Goodbye feature: ${goodbyeEnabled ? '_Enabled_' : '_Disabled_'}
					Channel set to: <#${goodbyeChannel}>
					Message set to:
					\`\`\`${goodbyeMessage}\`\`\`
				`);
		// Send the success response
		return msg.sendEmbed(goodbyeEmbed);
	}

	/**
	 * Handle errors in the command's execution
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ subCommand: string, content?: Channel | string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GoodbyeCommand
	 */
	private catchError(msg: KlasaMessage, args: { subCommand: string, content?: Channel | string }, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Build warning message
		let goodbyeWarn = stripIndents`
			Error occurred in \`goodbye\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`Goodbye ${args.subCommand.toLowerCase()}\`
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
		return sendSimpleEmbeddedError(msg, goodbyeUserWarn);
	}

	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		modLogMessage(msg, embed);

		// Send the success response
		return msg.sendEmbed(embed);
	}
}
