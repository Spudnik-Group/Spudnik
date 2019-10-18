import { stripIndents } from 'common-tags';
import { Channel, MessageEmbed } from 'discord.js';
import { getEmbedColor, modLogMessage, sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../../lib/helpers';
import * as format from 'date-fns/format';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Adjusts starboard settings.
 *
 * @export
 * @class StarboardCommand
 * @extends {Command}
 */
export default class StarboardCommand extends Command {
	/**
	 * Creates an instance of StarboardCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof StarboardCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Used to configure the :star: Star Board feature.',
			extendedHelp: stripIndents`
				syntax: \`!starboard <status|channel|trigger|enable|disable> (new starboard emoji | #channelMention)\`

				\`status\` - returns the star board configuration details.
				\`channel <#channelMention>\` - sets star board channel to the channel supplied.
				\`trigger <emoji>\` - sets emoji to save to star board.
				\`enable\` - enable the star board feature.
				\`disable\` - disable the star board feature.

				\`MANAGE_GUILD\` permission required.
			`,
			name: 'starboard',
			permissionLevel: 6,
			usage: '<on|off|status|channel|trigger> (content:channel|string)',
			requiredPermissions: ['EMBED_LINKS', 'READ_MESSAGE_HISTORY', 'ATTACH_FILES'],
		});
	}

	public async channel(msg: KlasaMessage, [content]): Promise<KlasaMessage | KlasaMessage[]> {
		const starboardEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/133/white-medium-star_2b50.png',
				name: 'Star Board'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const starboard = await msg.guild.settings.get('starboardChannel');
		if (content instanceof Channel) {
			const channelID = (content as Channel).id;

			if (starboard && starboard === channelID) {
				return sendSimpleEmbeddedMessage(msg, `Star Board channel already set to <#${channelID}>!`, 3000);
			} else {
				try {
					await msg.guild.settings.update('starboardChannel', channelID);
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
		} else {
			return sendSimpleEmbeddedError(msg, 'Invalid channel provided.', 3000);
		}
	}

	public async trigger(msg: KlasaMessage, [content]): Promise<KlasaMessage | KlasaMessage[]> {
		const starboardEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/133/white-medium-star_2b50.png',
				name: 'Star Board'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
		if (!content || !content.toString().match(emojiRegex)) {
			return sendSimpleEmbeddedMessage(msg, 'You must include the new emoji trigger along with the \`trigger\` command. See \`help starboard\` for details.', 3000);
		} else {
			try {
				await msg.guild.settings.update('starboardTrigger', content);
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
	}

	public async on(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const starboardEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/133/white-medium-star_2b50.png',
				name: 'Star Board'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const starboard = await msg.guild.settings.get('starboardChannel');
		const starboardEnabled: boolean = await msg.guild.settings.get('starboardEnabled');
		if (starboard) {
			if (starboardEnabled) {
				return sendSimpleEmbeddedMessage(msg, 'Star Board already enabled!', 3000);
			} else {
				try {
					await msg.guild.settings.update('starboardEnabled', true);
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
			}
		} else {
			return sendSimpleEmbeddedError(msg, 'Please set the channel for the Star Board before enabling the feature. See `!help starboard` for info.', 3000);
		}
	}

	public async off(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const starboardEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/133/white-medium-star_2b50.png',
				name: 'Star Board'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const starboardEnabled: boolean = await msg.guild.settings.get('starboardEnabled');
		if (starboardEnabled) {
			try {
				await msg.guild.settings.update('starboardEnabled', false);
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
			return sendSimpleEmbeddedMessage(msg, 'Star Board already disabled!', 3000);
		}
	}

	/**
	 * Run the "starboard" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ subCommand: string, content: Channel | string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof StarboardCommand
	 */
	public async status(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const starboardEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/133/white-medium-star_2b50.png',
				name: 'Star Board'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const starboard = await msg.guild.settings.get('starboardChannel');
		const starboardTrigger: string = await msg.guild.settings.get('starboardTrigger');
		const starboardEnabled: boolean = await msg.guild.settings.get('starboardEnabled');
		// Set up embed message
		starboardEmbed.setDescription(stripIndents`Star Board feature: ${starboardEnabled ? '_Enabled_' : '_Disabled_'}
										Channel set to: <#${starboard}>
										Reaction Trigger set to: ${starboardTrigger}`);
		if (starboard) {
			const botCanRead: boolean = await msg.guild.channels.get(starboard).permissionsFor(msg.client.user.id).has('READ_MESSAGE_HISTORY');
			const botCanPostLinks: boolean = await msg.guild.channels.get(starboard).permissionsFor(msg.client.user.id).has('EMBED_LINKS');
			const botCanPostAttachments: boolean = await msg.guild.channels.get(starboard).permissionsFor(msg.client.user.id).has('ATTACH_FILES');
			starboardEmbed.description += stripIndents`

						Permissions:
						* READ_MESSAGE_HISTORY: ${botCanRead}
						* EMBED_LINKS: ${botCanPostLinks}
						* ATTACH_FILES: ${botCanPostAttachments}`
		}

		// Send the success response
		return msg.sendEmbed(starboardEmbed);
	}

	private catchError(msg: KlasaMessage, args: { subCommand: string, content?: Channel | string }, err: Error) {
		// Build warning message
		let starboardWarn = stripIndents`
		Error occurred in \`starboard\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
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
		return sendSimpleEmbeddedError(msg, starboardUserWarn);
	}

	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		modLogMessage(msg, embed);
		// Send the success response
		return msg.sendEmbed(embed);
	}
}
