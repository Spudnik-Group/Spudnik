import { stripIndents } from 'common-tags';
import { Channel, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, stopTyping, sendSimpleEmbeddedMessage, deleteCommandMessages } from '../../lib/helpers';
import * as dateFns from 'date-fns';

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
					prompt: 'What sub-command would you like to use?\nOptions are:\n* channel\n* message\n* enable\n* disable',
					type: 'string',
					validate: (subCommand: string) => {
						const allowedSubCommands = ['message', 'channel', 'enable', 'disable'];
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
				syntax: \`!welcome <message|channel|enable|disable> (text | #channelMention)\`

				\`message (text to welcome/heckle)\` - Set/return the welcome message. Use { guild } for guild name, and { user } to reference the user joining. Leave blank to show current.
				\`channel <#channelMention>\` - Set the channel for the welcome message to be displayed.
				\`enable\` - Enable the welcome message feature.
				\`disable\` - Disable the welcome message feature.

				MANAGE_GUILD permission required.
			`,
			examples: [
				'!welcome message Please welcome {user} to the guild!',
				'!welcome message',
				'!welcome channel #general',
				'!welcome enable',
				'!welcome disable'
			],
			group: 'util',
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
	 * @param {CommandMessage} msg
	 * @param {{ subCommand: string, content: Channel | string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof WelcomeCommand
	 */
	public async run(msg: CommandMessage, args: { subCommand: string, content: Channel | string }): Promise<Message | Message[]> {
		const welcomeEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
				name: 'Server Welcome Message'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const modlogChannel = msg.guild.settings.get('modlogchannel', null);
		const welcomeChannel = msg.guild.settings.get(msg.guild.id, 'welcomeChannel');
		const welcomeMessage = msg.guild.settings.get('welcomeMessage', '@here, please Welcome {user} to {guild}!');
		const welcomeEnabled = msg.guild.settings.get('welcomeEnabled', false);

		startTyping(msg);

		switch (args.subCommand.toLowerCase()) {
			case 'channel': {
				if (args.content instanceof Channel) {
					const channelID = (args.content as Channel).id;
					if (welcomeChannel && welcomeChannel === channelID) {
						stopTyping(msg);
						return sendSimpleEmbeddedMessage(msg, `Welcome channel already set to <#${channelID}>!`, 3000);
					} else {
						msg.guild.settings.set('welcomeChannel', channelID)
							.then(() => {
								// Set up embed message
								welcomeEmbed.setDescription(stripIndents`
									**Member:** ${msg.author.tag} (${msg.author.id})
									**Action:** Welcome Channel set to <#${channelID}>}
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
			case 'message': {
				if (!args.content) {
					stopTyping(msg);
					return sendSimpleEmbeddedMessage(msg, 'You must include the new message along with the `message` command. See `help welcome` for details.\nCurrent Welcome Message: ```' + welcomeMessage + '```', 3000);
				} else {
					msg.guild.settings.set('welcomeMessage', args.content)
						.then(() => {
							// Set up embed message
							welcomeEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Welcome message set to:
								\`\`\`${args.content}\`\`\`\n
								Welcome Message: ${(welcomeEnabled ? '_Enabled_' : '_Disabled_')}
							`);
							if (welcomeEnabled && welcomeChannel instanceof Channel)
								welcomeEmbed.description += `\nWelcome channel: <#${welcomeChannel}>`;
							else if (welcomeEnabled && welcomeChannel! instanceof Channel)
								welcomeEmbed.description += '\nWelcome messages will not display, as a welcome channel is not set. Use `welcome channel [channel ref]`.';
						})
						.catch((err: Error) => this.catchError(msg, args, err));
				}
				break;
			}
			case 'enable': {
				if (!welcomeEnabled) {
					msg.guild.settings.set('welcomeEnabled', true)
						.then(() => {
							// Set up embed message
							welcomeEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Welcome messages set to:
								_Enabled_\n
								Welcome Channel: <#${welcomeChannel}>
							`);
						})
						.catch((err: Error) => this.catchError(msg, args, err));
				} else {
					stopTyping(msg);
					return sendSimpleEmbeddedMessage(msg, 'Welcome message already enabled!', 3000);
				}
				break;
			}
			case 'disable': {
				if (welcomeEnabled) {
					msg.guild.settings.set('welcomeEnabled', false)
						.then(() => {
							// Set up embed message
							welcomeEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Welcome messages set to:
								_Disabled_\n
								Welcome Channel: <#${welcomeChannel}>
							`);
						})
						.catch((err: Error) => this.catchError(msg, args, err));
				} else {
					stopTyping(msg);
					return sendSimpleEmbeddedMessage(msg, 'Welcome message already disabled!', 3000);
				}
				break;
			}
		}
		
		// Log the event in the mod log
		if (msg.guild.settings.get('modlogEnabled', true)) {
			modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, welcomeEmbed);
		}
		deleteCommandMessages(msg, this.client);
		stopTyping(msg);

		// Send the success response
		return msg.embed(welcomeEmbed);
	}
	
	private catchError(msg: CommandMessage, args: { subCommand: string, content: Channel | string }, err: Error) {
		// Build warning message
		let welcomeWarn = stripIndents`
		Error occurred in \`welcome\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${dateFns.format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
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
}
