import { stripIndents } from 'common-tags';
import { Channel, Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

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
					type: 'string'
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
		});

		let welcomeChannel = msg.client.provider.get(msg.guild.id, 'welcomeChannel');
		// Quick migration for old channel references in database
		if (welcomeChannel instanceof Channel) {
			msg.client.provider.set(msg.guild.id, 'welcomeChannel', welcomeChannel.id);
			welcomeChannel = welcomeChannel.id;
		}
		const welcomeMessage = msg.client.provider.get(msg.guild.id, 'welcomeMessage', '@here, please Welcome {user} to {guild}!');
		const welcomeEnabled = msg.client.provider.get(msg.guild.id, 'welcomeEnabled', false);
		switch (args.subCommand.toLowerCase()) {
			case 'channel': {
				if (args.content instanceof Channel) {
					const channelID = (args.content as Channel).id;
					if (welcomeChannel && welcomeChannel === channelID) {
						welcomeEmbed.description = `Welcome channel already set to <#${channelID}>!`;
						return msg.embed(welcomeEmbed);
					} else {
						return msg.client.provider.set(msg.guild.id, 'welcomeChannel', channelID)
							.then(() => {
								welcomeEmbed.description = `Welcome channel set to <#${channelID}>.`;
								return msg.embed(welcomeEmbed);
							})
							.catch((err: Error) => {
								msg.client.emit('warn', `Error in command util:welcome: ${err}`);
								return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
							});
					}
				} else {
					return sendSimpleEmbeddedError(msg, 'Invalid channel provided.', 3000);
				}
			}
			case 'message': {
				if (args.content === undefined || args.content === '') {
					welcomeEmbed.description = 'You must include the new message along with the `message` command. See `help welcome` for details.\nThe current welcome message is set to: ```' + welcomeMessage + '```';
					return msg.embed(welcomeEmbed);
				} else {
					return msg.client.provider.set(msg.guild.id, 'welcomeMessage', args.content)
						.then(() => {
							welcomeEmbed.description =
								stripIndents`Welcome message set to:
								\`\`\`${args.content}\`\`\`
								Currently, welcome messages are ${(welcomeEnabled ? '_Enabled_' : '_Disabled_')}.`;
							
							if (welcomeEnabled)
								welcomeEmbed.description += `\nWelcome messages are displaying in this channel: <#${welcomeChannel}>`;
							else if (welcomeEnabled && welcomeChannel! instanceof Channel)
								welcomeEmbed.description += '\nWelcome messages will not display, as a welcome channel is not set. Use `welcome channel [channel ref]`.';
							
							return msg.embed(welcomeEmbed);
						})
						.catch((err: Error) => {
							msg.client.emit('warn', `Error in command util:welcome: ${err}`);
							return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
						});
				}
			}
			case 'enable': {
				if (welcomeEnabled === false) {
					return msg.client.provider.set(msg.guild.id, 'welcomeEnabled', true)
						.then(() => {
							welcomeEmbed.description = `Welcome message enabled.\nWelcome channel set to: <#${welcomeChannel}>\nWelcome message set to: ${welcomeMessage}`;
							return msg.embed(welcomeEmbed);
						})
						.catch((err: Error) => {
							msg.client.emit('warn', `Error in command util:welcome: ${err}`);
							return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
						});
				} else {
					welcomeEmbed.description = 'Welcome message is already enabled! Disable with `welcome disable`';
					return msg.embed(welcomeEmbed);
				}
			}
			case 'disable': {
				if (welcomeEnabled === true) {
					return msg.client.provider.set(msg.guild.id, 'welcomeEnabled', false)
						.then(() => {
							welcomeEmbed.description = `Welcome message disabled.\nWelcome channel set to: <#${welcomeChannel}>\nWelcome message set to: ${welcomeMessage}`;
							return msg.embed(welcomeEmbed);
						})
						.catch((err: Error) => {
							msg.client.emit('warn', `Error in command util:welcome: ${err}`);
							return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
						});
				} else {
					welcomeEmbed.description = 'Welcome message is already disabled! Enable with `welcome enable`';
					return msg.embed(welcomeEmbed);
				}
			}
			default: {
				return sendSimpleEmbeddedError(msg, 'Invalid subcommand. Please see `help welcome`.', 3000);
			}
		}
	}
}
