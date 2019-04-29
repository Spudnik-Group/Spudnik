import { stripIndents } from 'common-tags';
import { Channel, Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, sendSimpleEmbeddedMessage, stopTyping } from '../../lib/helpers';
import * as format from 'date-fns/format';

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
					prompt: '#channelMention or goodbye text\n',
					type: 'channel|string'
				}
			],
			description: 'Used to configure the message to be sent when a user leaves your guild.',
			details: stripIndents`
				syntax: \`!goodbye <status|message|channel|enable|disable> (text | #channelMention)\`

				\`status\` - return the goodbye feature configuration details.
				\`message (text to say goodbye/heckle)\` - set the goodbye message. Use { guild } for guild name, and { user } to reference the user leaving.
				\`channel <#channelMention>\` - set the channel for the goodbye message to be displayed.
				\`enable\` - enable the goodbye message feature.
				\`disable\` - disable the goodbye message feature.

				MANAGE_GUILD permission required.
			`,
			examples: [
				'!goodbye message Everyone mourn the loss of {user}',
				'!goodbye status',
				'!goodbye channel #general',
				'!goodbye enable',
				'!goodbye disable'
			],
			group: 'feature',
			guildOnly: true,
			memberName: 'goodbye',
			name: 'goodbye',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['MANAGE_GUILD']
		});
	}

	/**
	 * Run the "goodbye" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ subCommand: string, content: Channel | string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof GoodbyeCommand
	 */
	public async run(msg: CommandoMessage, args: { subCommand: string, content: Channel | string }): Promise<Message | Message[]> {
		const goodbyeEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
				name: 'Server Goodbye Message'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const goodbyeChannel = await msg.guild.settings.get('goodbyeChannel', null);
		const goodbyeMessage = await msg.guild.settings.get('goodbyeMessage', '{user} has left the server.');
		const goodbyeEnabled = await msg.guild.settings.get('goodbyeEnabled', false);
		
		startTyping(msg);

		switch (args.subCommand.toLowerCase()) {
			case 'channel': {
				if (args.content instanceof Channel) {
					const channelID = (args.content as Channel).id;

					if (goodbyeChannel && goodbyeChannel === channelID) {
						stopTyping(msg);

						return sendSimpleEmbeddedMessage(msg, `Goodbye channel already set to <#${channelID}>!`, 3000);
					} else {
						msg.guild.settings.set('goodbyeChannel', channelID)
							.then(() => {
								// Set up embed message
								goodbyeEmbed.setDescription(stripIndents`
									**Member:** ${msg.author.tag} (${msg.author.id})
									**Action:** Goodbye Channel set to <#${channelID}>
								`);

								return this.sendSuccess(msg, goodbyeEmbed);
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

					return sendSimpleEmbeddedMessage(msg, 'You must include the new message along with the `message` command. See `help goodbye` for details.', 3000);
				} else {
					msg.guild.settings.set('goodbyeMessage', args.content)
						.then(() => {
							// Set up embed message
							goodbyeEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Goodbye message set to:
								\`\`\`${args.content}\`\`\`
							`);

							return this.sendSuccess(msg, goodbyeEmbed);
						})
						.catch((err: Error) => this.catchError(msg, args, err));
				}
				break;
			}
			case 'enable': {
				if (goodbyeChannel) {
					if (goodbyeEnabled) {
						stopTyping(msg);
	
						return sendSimpleEmbeddedMessage(msg, 'Goodbye message already enabled!', 3000);
					} else {
						msg.guild.settings.set('goodbyeEnabled', true)
							.then(() => {
								// Set up embed message
								goodbyeEmbed.setDescription(stripIndents`
									**Member:** ${msg.author.tag} (${msg.author.id})
									**Action:** Goodbye messages set to: _Enabled_
								`);
	
								return this.sendSuccess(msg, goodbyeEmbed);
							})
							.catch((err: Error) => this.catchError(msg, args, err));
					}
				} else {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, 'Please set the channel for the goodbye message before enabling the feature. See `help goodbye` for info.', 3000);
				}
				break;
			}
			case 'disable': {
				if (goodbyeEnabled) {
					msg.guild.settings.set('goodbyeEnabled', false)
						.then(() => {
							// Set up embed message
							goodbyeEmbed.setDescription(stripIndents`
								**Member:** ${msg.author.tag} (${msg.author.id})
								**Action:** Goodbye messages set to: _Disabled_
							`);

							return this.sendSuccess(msg, goodbyeEmbed);
						})
						.catch((err: Error) => this.catchError(msg, args, err));
				} else {
					stopTyping(msg);

					return sendSimpleEmbeddedMessage(msg, 'Goodbye message already disabled!', 3000);
				}
				break;
			}
			case 'status': {
				// Set up embed message
				goodbyeEmbed.setDescription(stripIndents`Goodbye feature: ${goodbyeEnabled ? '_Enabled_' : '_Disabled_'}
				Channel set to: <#${goodbyeChannel}>
				Message set to:
				\`\`\`${goodbyeMessage}\`\`\` `)
				deleteCommandMessages(msg);
				stopTyping(msg);

				// Send the success response
				return msg.embed(goodbyeEmbed);
				break;
			}
		}
	}
	
	private catchError(msg: CommandoMessage, args: { subCommand: string, content: Channel | string }, err: Error) {
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
			case 'enable': {
				goodbyeUserWarn = 'Enabling goodbye feature failed!';
				break;
			}
			case 'disable': {
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
		
		stopTyping(msg);

		// Emit warn event for debugging
		msg.client.emit('warn', goodbyeWarn);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, goodbyeUserWarn);
	}

	private sendSuccess(msg: CommandoMessage, embed: MessageEmbed): Promise<Message | Message[]> {
		modLogMessage(msg, embed);
		deleteCommandMessages(msg);
		stopTyping(msg);

		// Send the success response
		return msg.embed(embed);
	}
}
