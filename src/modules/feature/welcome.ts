import { stripIndents } from 'common-tags';
import { Channel, Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, stopTyping, sendSimpleEmbeddedMessage } from '../../lib/helpers';
import * as format from 'date-fns/format';

/**
 * Manage notifications when someone joins the guild.
 *
 * @export
 * @class WelcomeCommand
 * @extends {Command}
 */
export default class WelcomeCommand extends Command {
	/**
	 * Creates an instance of WelcomeCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof WelcomeCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'subCommand',
					prompt: 'What sub-command would you like to use?\nOptions are:\n* status\n* channel\n* message\n* enable\n* disable',
					type: 'string',
					validate: (subCommand: string) => {
						const allowedSubCommands = ['message', 'channel', 'enable', 'disable', 'status'];
						if (allowedSubCommands.indexOf(subCommand) !== -1) return true;
						
						return 'You provided an invalid subcommand.';
					}
				},
				{
					default: '',
					key: 'content',
					prompt: '#channelMention or welcome text\n',
					type: 'channel|string'
				}
			],
			description: 'Used to configure the message to be sent when a new user join your guild.',
			details: stripIndents`
				syntax: \`!welcome <status|message|channel|enable|disable> (text | #channelMention)\`

				\`status\` - return the welcome feature configuration details.
				\`message (text to welcome/heckle)\` - set the welcome message. Use { guild } for guild name, and { user } to reference the user joining.
				\`channel <#channelMention>\` - set the channel for the welcome message to be displayed.
				\`enable\` - enable the welcome message feature.
				\`disable\` - disable the welcome message feature.

				MANAGE_GUILD permission required.
			`,
			examples: [
				'!welcome message Please welcome {user} to the guild!',
				'!welcome status',
				'!welcome channel #general',
				'!welcome enable',
				'!welcome disable'
			],
			group: 'feature',
			guildOnly: true,
			memberName: 'welcome',
			name: 'welcome',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['MANAGE_GUILD']
		});
	}

	/**
	 * Run the "welcome" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ subCommand: string, content: Channel | string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof WelcomeCommand
	 */
	public async run(msg: CommandoMessage, args: { subCommand: string, content: Channel | string }): Promise<Message | Message[]> {
		const welcomeEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
				name: 'Server Welcome Message'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const welcomeChannel = await msg.guild.settings.get('welcomeChannel', null);
		const welcomeMessage = await msg.guild.settings.get('welcomeMessage', '@here, please Welcome {user} to {guild}!');
		const welcomeEnabled = await msg.guild.settings.get('welcomeEnabled', false);

		startTyping(msg);

		switch (args.subCommand.toLowerCase()) {
			case 'channel': {
				if (args.content instanceof Channel) {
					const channelID = (args.content as Channel).id;

					if (welcomeChannel && welcomeChannel === channelID) {
						stopTyping(msg);

						return sendSimpleEmbeddedMessage(msg, `Welcome channel already set to <#${channelID}>!`, 3000);
					} else {
						try {
							await msg.guild.settings.set('welcomeChannel', channelID);
							// Set up embed message
							welcomeEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Welcome Channel set to <#${channelID}>
							`);
							welcomeEmbed.setFooter('Use the `welcome status` command to see the details of this feature');

							return this.sendSuccess(msg, welcomeEmbed);
						} catch (err) {
							return this.catchError(msg, args, err);
						}
					}
				} else {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, 'Invalid channel provided.', 3000);
				}
			}
			case 'message': {
				if (!args.content) {
					stopTyping(msg);

					return sendSimpleEmbeddedMessage(msg, 'You must include the new message along with the `message` command. See `help welcome` for details.', 3000);
				} else {
					try {
						await msg.guild.settings.set('welcomeMessage', args.content);
						// Set up embed message
						welcomeEmbed.setDescription(stripIndents`
							**Member:** ${msg.author.tag} (${msg.author.id})
							**Action:** Welcome message set to:
							\`\`\`${args.content}\`\`\`
						`);
						welcomeEmbed.setFooter('Use the `welcome status` command to see the details of this feature');

						return this.sendSuccess(msg, welcomeEmbed);
					} catch (err) {
						return this.catchError(msg, args, err);
					}
				}
			}
			case 'enable': {
				if (welcomeChannel) {
					if (welcomeEnabled) {
						stopTyping(msg);
	
						return sendSimpleEmbeddedMessage(msg, 'Welcome message already enabled!', 3000);
					} else {
						try {
							await msg.guild.settings.set('welcomeEnabled', true);
							// Set up embed message
							welcomeEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Welcome messages set to: _Enabled_
							`);
							welcomeEmbed.setFooter('Use the `welcome status` command to see the details of this feature');

							return this.sendSuccess(msg, welcomeEmbed);
						} catch (err) {
							return this.catchError(msg, args, err);
						}
					}
				} else {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, 'Please set the channel for the welcome message before enabling the feature. See `help welcome` for info.', 3000);
				}
			}
			case 'disable': {
				if (welcomeEnabled) {
					try {
						await msg.guild.settings.set('welcomeEnabled', false);
						// Set up embed message
						welcomeEmbed.setDescription(stripIndents`
							**Member:** ${msg.author.tag} (${msg.author.id})
							**Action:** Welcome messages set to: _Disabled_
						`);
						welcomeEmbed.setFooter('Use the `welcome status` command to see the details of this feature');

						return this.sendSuccess(msg, welcomeEmbed);
					} catch (err) {
						return this.catchError(msg, args, err);
					}
				} else {
					stopTyping(msg);

					return sendSimpleEmbeddedMessage(msg, 'Welcome message already disabled!', 3000);
				}
			}
			case 'status': {
				// Set up embed message
				welcomeEmbed.setDescription(stripIndents`
					Welcome feature: ${welcomeEnabled ? '_Enabled_' : '_Disabled_'}
					Channel set to: <#${welcomeChannel}>
					Message set to:
					\`\`\`${welcomeMessage}\`\`\`
				`);
				deleteCommandMessages(msg);
				stopTyping(msg);

				// Send the success response
				return msg.embed(welcomeEmbed);
			}
		}
	}
	
	private catchError(msg: CommandoMessage, args: { subCommand: string, content: Channel | string }, err: Error) {
		// Build warning message
		let welcomeWarn = stripIndents`
		Error occurred in \`welcome\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		**Input:** \`Welcome ${args.subCommand.toLowerCase()}\``;
		let welcomeUserWarn = '';

		switch (args.subCommand.toLowerCase()) {
			case 'enable': {
				welcomeUserWarn = 'Enabling welcome feature failed!';
				break;
			}
			case 'disable': {
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
		
		stopTyping(msg);

		// Emit warn event for debugging
		msg.client.emit('warn', welcomeWarn);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, welcomeUserWarn);
	}

	private sendSuccess(msg: CommandoMessage, embed: MessageEmbed): Promise<Message | Message[]> {
		modLogMessage(msg, embed);
		deleteCommandMessages(msg);
		stopTyping(msg);

		// Send the success response
		return msg.embed(embed);
	}
}
