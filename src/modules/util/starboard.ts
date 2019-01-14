import { stripIndents } from 'common-tags';
import { Channel, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, stopTyping, sendSimpleEmbeddedMessage, deleteCommandMessages } from '../../lib/helpers';
import moment = require('moment');

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
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'subCommand',
					prompt: 'What sub-command would you like to use?\nOptions are:\n* status\n* channel\n* trigger\n* enable\n* disable',
					type: 'string',
					validate: (subCommand: string) => {
						const allowedSubcommands = ['status', 'channel', 'trigger', 'enable', 'disable'];
						if (allowedSubcommands.indexOf(subCommand) !== -1) return true;
						return 'You provided an invalid subcommand.';
					}
				},
				{
					default: '',
					key: 'content',
					prompt: 'channelMention or trigger emoji',
					type: 'channel|string'
				}
			],
			clientPermissions: ['EMBED_LINKS', 'READ_MESSAGE_HISTORY', 'ATTACH_FILES'],
			description: 'Used to configure the :star: Star Board feature.',
			details: stripIndents`
				syntax: \`!starboard <status|channel|trigger|enable|disable> (new starboard emoji | #channelMention)\`

				\`status\` - returns the starboard configuration details.
				\`channel <#channelMention>\` - sets Star Board channel to the channel supplied.
				\`trigger <emoji>\` - sets emoji to save to star board. If blank, shows current trigger emoji.
				\`enable\` - enables the Star Board feature.
				\`disable\` - disables the Star Board feature.

				MANAGE_GUILD permission required.
			`,
			examples: [
				'!starboard status',
				'!starboard channel #starboard',
				'!starboard trigger',
				'!starboard trigger :stuck_out_tongue:',
				'!starboard enable',
				'!starboard disable'
			],
			group: 'util',
			guildOnly: true,
			memberName: 'starboard',
			name: 'starboard',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['MANAGE_GUILD']
		});
	}

	/**
	 * Run the "starboard" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ subCommand: string, content: Channel | string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof StarboardCommand
	 */
	public async run(msg: CommandMessage, args: { subCommand: string, content: Channel | string }): Promise<Message | Message[]> {
		const starboardEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/133/white-medium-star_2b50.png',
				name: 'Star Board'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const modlogChannel = msg.guild.settings.get('modlogchannel', null);
		const starboard = msg.guild.settings.get('starboardChannel', null);
		const starboardTrigger: string = msg.guild.settings.get('starboardTrigger', '⭐');
		const starboardEnabled: boolean = msg.guild.settings.get('starboardEnabled', false);
		const botCanRead: boolean = msg.guild.channels.get(starboard).permissionsFor(msg.client.user.id).has('READ_MESSAGE_HISTORY');
		const botCanPostLinks: boolean = msg.guild.channels.get(starboard).permissionsFor(msg.client.user.id).has('EMBED_LINKS');
		const botCanPostAttachments: boolean = msg.guild.channels.get(starboard).permissionsFor(msg.client.user.id).has('ATTACH_FILES');

		switch (args.subCommand.toLowerCase()) {
			case 'channel': {
				if (args.content instanceof Channel) {
					const channelID = (args.content as Channel).id;
					if (starboard && starboard === channelID) {
						stopTyping(msg);
						return sendSimpleEmbeddedMessage(msg, `Goodbye channel already set to <#${channelID}>!`, 3000);
					} else {
						msg.guild.settings.set('starboardChannel', channelID)
							.then(() => {
								// Set up embed message
								starboardEmbed.setDescription(stripIndents`
									**Member:** ${msg.author.tag} (${msg.author.id})
									**Action:** Star Board Channel set to <#${channelID}>}
								`);
							})
							.catch((err: Error) => this.catchError(msg, args, err));
					}
				} else {
					stopTyping(msg);
					return sendSimpleEmbeddedError(msg, 'Invalid channel provided.', 3000);
				}
				break;
			}
			case 'trigger': {
				const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
				if (!args.content || !args.content.toString().match(emojiRegex)) {
					stopTyping(msg);
					return sendSimpleEmbeddedMessage(msg, 'You must include the new emoji trigger along with the \`trigger\` command. See \`help starboard\` for details.', 3000);
				} else {
					msg.guild.settings.set('starboardTrigger', args.content)
						.then(() => {
							// Set up embed message
							starboardEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Star Board trigger set to: ${args.content}\n
								Star Board: ${(starboardEnabled ? '_Enabled_' : '_Disabled_')}
							`);
						})
						.catch((err: Error) => this.catchError(msg, args, err));
				}
				break;
			}
			case 'enable': {
				if (starboard) {
					if (!starboardEnabled) {
						msg.guild.settings.set('starboardEnabled', true)
							.then(() => {
								// Set up embed message
								starboardEmbed.setDescription(stripIndents`
									**Member:** ${msg.author.tag} (${msg.author.id})
									**Action:** Star Board set to:
									_Enabled_\n
									Star Board Channel: <#${starboard}>
								`);
							})
							.catch((err: Error) => this.catchError(msg, args, err));
					} else {
						stopTyping(msg);
						return sendSimpleEmbeddedMessage(msg, 'Star Board already enabled!', 3000);
					}
				} else {
					stopTyping(msg);
					return sendSimpleEmbeddedError(msg, 'Please set the channel for the Star Board before enabling the feature. See `!help starboard` for info.', 3000);
				}
				break;
			}
			case 'disable': {
				if (starboardEnabled) {
					msg.guild.settings.set('starboardEnabled', false)
						.then(() => {
							// Set up embed message
							starboardEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Star Board set to:
								_Disabled_\n
								Star Board Channel: <#${starboard}>
							`);
						})
						.catch((err: Error) => this.catchError(msg, args, err));
				} else {
					stopTyping(msg);
					return sendSimpleEmbeddedMessage(msg, 'Star Board already disabled!', 3000);
				}
				break;
			}
			case 'status': {
				// Set up embed message
				starboardEmbed.setDescription(`Star Board feature: ${starboardEnabled ? '_Enabled_' : '_Disabled_'}
										Channel set to: <#${starboard}>
										Permissions:
										* READ_MESSAGE_HISTORY: ${botCanRead}
										* EMBED_LINKS: ${botCanPostLinks}
										* ATTACH_FILES: ${botCanPostAttachments}
										Trigger set to: ${starboardTrigger}`);
				break;
			}
		}
		
		// Log the event in the mod log
		if (msg.guild.settings.get('modlogs', true)) {
			modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, starboardEmbed);
		}
		deleteCommandMessages(msg, this.client);
		stopTyping(msg);

		// Send the success response
		return msg.embed(starboardEmbed);
	}
	
	private catchError(msg: CommandMessage, args: { subCommand: string, content: Channel | string }, err: Error) {
		// Build warning message
		let starboardWarn = stripIndents`
		Error occurred in \`starboard\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		**Input:** \`Starboard ${args.subCommand}\``;
		let starboardUserWarn = '';
		switch (args.subCommand) {
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
		
		stopTyping(msg);
		// Emit warn event for debugging
		msg.client.emit('warn', starboardWarn);
		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, starboardUserWarn);
	}
}
