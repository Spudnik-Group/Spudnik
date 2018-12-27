import { stripIndents } from 'common-tags';
import { Channel, Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

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
					prompt: 'What sub-command would you like to use?\nOptions are:\n* channel\n* message\n* enable\n* disable',
					type: 'string'
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
				syntax: \`!goodbye <message|channel|enable|disable> (text | #channelMention)\`

				\`message (text to say goodbye/heckle)\` - Set/return the goodbye message. Use { guild } for guild name, and { user } to reference the user joining. Leave blank to show current.
				\`channel <#channelMention>\` - Set the channel for the goodbye message to be displayed.
				\`enable\` - Enable the goodbye message feature.
				\`disable\` - Disable the goodbye message feature.

				MANAGE_GUILD permission required.
			`,
			examples: [
				'!goodbye message Everyone mourn the loss of {user}',
				'!goodbye',
				'!goodbye channel #general',
				'!goodbye enable',
				'!goodbye disable'
			],
			group: 'util',
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
	 * @param {CommandMessage} msg
	 * @param {{ subCommand: string, content: Channel | string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof GoodbyeCommand
	 */
	public async run(msg: CommandMessage, args: { subCommand: string, content: Channel | string }): Promise<Message | Message[]> {
		const goodbyeEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
				name: 'Server Goodbye Message'
			},
			color: getEmbedColor(msg)
		});

		let goodbyeChannel = msg.client.provider.get(msg.guild.id, 'goodbyeChannel');
		// Quick migration for old channel references in database
		if (goodbyeChannel instanceof Channel) {
			msg.client.provider.set(msg.guild.id, 'goodbyeChannel', goodbyeChannel.id);
			goodbyeChannel = goodbyeChannel.id;
		}
		const goodbyeMessage = msg.client.provider.get(msg.guild.id, 'goodbyeMessage', '{user} has left the server.');
		const goodbyeEnabled = msg.client.provider.get(msg.guild.id, 'goodbyeEnabled', false);
		switch (args.subCommand.toLowerCase()) {
			case 'channel': {
				if (args.content instanceof Channel) {
					const channelID = (args.content as Channel).id;
					if (goodbyeChannel && goodbyeChannel === channelID) {
						goodbyeEmbed.description = `Goodbye channel already set to <#${channelID}>!`;
						return msg.embed(goodbyeEmbed);
					} else {
						return msg.client.provider.set(msg.guild.id, 'goodbyeChannel', channelID)
							.then(() => {
								goodbyeEmbed.description = `Goodbye channel set to <#${channelID}>.`;
								return msg.embed(goodbyeEmbed);
							})
							.catch((err: Error) => {
								msg.client.emit('warn', `Error in command util:goodbye: ${err}`);
								return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
							});
					}
				} else {
					return sendSimpleEmbeddedError(msg, 'Invalid channel provided.', 3000);
				}
			}
			case 'message': {
				if (args.content === undefined || args.content === '') {
					goodbyeEmbed.description = 'You must include the new message along with the `message` command. See `help goodbye` for details.\nThe current goodbye message is set to: ```' + goodbyeMessage + '```';
					return msg.embed(goodbyeEmbed);
				} else {
					return msg.client.provider.set(msg.guild.id, 'goodbyeMessage', args.content)
						.then(() => {
							goodbyeEmbed.description =
								stripIndents`Goodbye message set to:
								\`\`\`${args.content}\`\`\`
								Currently, goodbye messages are ${(goodbyeEnabled ? '_Enabled_' : '_Disabled_')}.`;

							if (goodbyeEnabled && goodbyeChannel instanceof Channel)
								goodbyeEmbed.description += `\nGoodbye messages are displaying in this channel: <#${goodbyeChannel}>`;
							else if (goodbyeEnabled && goodbyeChannel! instanceof Channel)
								goodbyeEmbed.description += '\nGoodbye messages will not display, as a goodbye channel is not set. Use `goodbye channel [channel ref]`.';

							return msg.embed(goodbyeEmbed);
						})
						.catch((err: Error) => {
							msg.client.emit('warn', `Error in command util:goodbye: ${err}`);
							return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
						});
				}
			}
			case 'enable': {
				if (goodbyeEnabled === false) {
					return msg.client.provider.set(msg.guild.id, 'goodbyeEnabled', true)
						.then(() => {
							goodbyeEmbed.description =
								stripIndents`Goodbye messages are set to: _Enabled_
								And, are displaying in this channel: <#${goodbyeChannel}>`;
							return msg.embed(goodbyeEmbed);
						})
						.catch((err: Error) => {
							msg.client.emit('warn', `Error in command util:goodbye: ${err}`);
							return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
						});
				} else {
					goodbyeEmbed.description = 'Goodbye message is already enabled! Disable with `goodbye disable`';
					return msg.embed(goodbyeEmbed);
				}
			}
			case 'disable': {
				if (goodbyeEnabled === true) {
					return msg.client.provider.set(msg.guild.id, 'goodbyeEnabled', false)
						.then(() => {
							goodbyeEmbed.description = 'Goodbye message disabled.';
							return msg.embed(goodbyeEmbed);
						})
						.catch((err: Error) => {
							msg.client.emit('warn', `Error in command util:goodbye: ${err}`);
							return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
						});
				} else {
					goodbyeEmbed.description = 'Goodbye message is already disabled! Enable with `goodbye enable`';
					return msg.embed(goodbyeEmbed);
				}
			}
			default: {
				return sendSimpleEmbeddedError(msg, 'Invalid subcommand. Please see `help goodbye`.', 3000);
			}
		}
	}
}
