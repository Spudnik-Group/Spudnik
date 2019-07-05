import { stripIndents } from 'common-tags';
import { Message, MessageEmbed, Channel } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, startTyping, stopTyping } from '../../lib/helpers';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import * as format from 'date-fns/format';

/**
 * Enable or disable the Modlog feature.
 *
 * @export
 * @class ModlogCommand
 * @extends {Command}
 */
export default class ModlogCommand extends Command {
	/**
	 * Creates an instance of ModlogCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ModlogCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'subCommand',
					prompt: 'What sub-command would you like to use?\nOptions are:\n* status\n* channel\n* enable\n* disable',
					type: 'string',
					validate: (subCommand: string) => {
						const allowedSubCommands = ['status', 'enable', 'disable', 'channel'];
						if (allowedSubCommands.indexOf(subCommand) !== -1) return true;
						
						return 'You provided an invalid subcommand.';
					}
				},
				{
					default: '',
					key: 'channel',
					prompt: '#channelMention',
					type: 'channel'
				}
			],
			description: 'Enable or disable the modlog feature.',
			details: stripIndents`
				syntax: \`!modlog <status|enable|disable|channel> (#channelMention)\`

				\`status\` - return the mod log configuration details.
				\`channel <#channelMention>\` - set mod log channel to the channel supplied.
				\`enable\` - enable the mod log feature.
				\`disable\` - disable the mod log feature.
				
				MANAGE_GUILD permission required.`,
			examples: [
				'!modlog status',
				'!modlog enable',
				'!modlog disable',
				'!modlog channel #modlog'
			],
			group: 'feature',
			guildOnly: true,
			memberName: 'modlog',
			name: 'modlog',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['MANAGE_GUILD']
		});
	}

	/**
	 * Run the "Modlog" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ subCommand: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof ModlogCommand
	 */
	public async run(msg: CommandoMessage, args: { subCommand: string, channel: Channel }): Promise<Message | Message[]> {
		const modlogChannel = await msg.guild.settings.get('modlogChannel', null);
		const modlogEnabled = await msg.guild.settings.get('modlogEnabled', false);
		const modlogEmbed: MessageEmbed = new MessageEmbed({
			author: {
				iconURL: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/memo_1f4dd.png',
				name: 'Mod Log'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		startTyping(msg);

		switch (args.subCommand.toLowerCase()) {
			case 'enable': {
				if (modlogChannel) {
					if (modlogEnabled) {
						stopTyping(msg);

						return sendSimpleEmbeddedMessage(msg, 'Modlog feature already enabled!', 3000);
					} else {
						msg.guild.settings.set('modlogEnabled', true)
							.then(() => {
								// Set up embed message
								modlogEmbed.setDescription(stripIndents`
									**Member:** ${msg.author.tag} (${msg.author.id})
									**Action:** Modlog set to: _Enabled_
								`);
								modlogEmbed.setFooter('Use the `modlog status` command to see the details of this feature');

								return this.sendSuccess(msg, modlogEmbed);
							})
							.catch((err: Error) => this.catchError(msg, args, err));
					}
				} else {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, 'Please set the channel for the modlog before enabling the feature. See `!help modlog` for info.', 3000);
				}
				break;
			}
			case 'disable': {
				if (modlogEnabled) {
					msg.guild.settings.set('modlogEnabled', false)
						.then(() => {
							// Set up embed message
							modlogEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Modlog set to: _Disabled_
							`);
							modlogEmbed.setFooter('Use the `modlog status` command to see the details of this feature');

							return this.sendSuccess(msg, modlogEmbed);
						})
						.catch((err: Error) => this.catchError(msg, args, err));
				} else {
					stopTyping(msg);

					return sendSimpleEmbeddedMessage(msg, 'Modlog feature already disabled!', 3000);
				}
				break;
			}
			case 'channel': {
				if (args.channel instanceof Channel) {
					const channelID = (args.channel as Channel).id;

					if (modlogChannel && modlogChannel === channelID) {
						stopTyping(msg);

						return sendSimpleEmbeddedMessage(msg, `Modlog channel already set to <#${channelID}>!`, 3000);
					} else {
						msg.guild.settings.set('modlogChannel', channelID)
							.then(() => {
								// Set up embed message
								modlogEmbed.setDescription(stripIndents`
									**Member:** ${msg.author.tag} (${msg.author.id})
									**Action:** Modlog Channel set to <#${channelID}>
								`);
								modlogEmbed.setFooter('Use the `modlog status` command to see the details of this feature');

								return this.sendSuccess(msg, modlogEmbed);
							})
							.catch((err: Error) => this.catchError(msg, args, err));
					}
				} else {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, 'Invalid channel provided.', 3000);
				}
				break;
			}
			case 'status': {
				// Set up embed message
				modlogEmbed.setDescription(stripIndents`Modlog feature: ${modlogEnabled ? '_Enabled_' : '_Disabled_'}
										Channel set to: <#${modlogChannel}>`);
				deleteCommandMessages(msg);
				stopTyping(msg);

				// Send the success response
				return msg.embed(modlogEmbed);
				break;
			}
		}
	}

	private catchError(msg: CommandoMessage, args: { subCommand: string, channel: Channel }, err: Error) {
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
		
		stopTyping(msg);

		// Emit warn event for debugging
		msg.client.emit('warn', modlogWarn);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, modlogUserWarn);
	}

	private sendSuccess(msg: CommandoMessage, embed: MessageEmbed): Promise<Message | Message[]> {
		modLogMessage(msg, embed);
		deleteCommandMessages(msg);
		stopTyping(msg);

		// Send the success response
		return msg.embed(embed);
	}
}
