import { oneLine } from 'common-tags';
import { Channel, Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

/**
 * Sets/Shows the terms of service for a guild.
 *
 * @export
 * @class TermsOfServiceCommand
 * @extends {Command}
 */
export default class TermsOfServiceCommand extends Command {
	/**
	 * Creates an instance of TermsOfServiceCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof TermsOfServiceCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					default: '',
					key: 'arg1',
					prompt: 'What sub-command would you like to use?\nOptions are:\n* channel\n* title\n* body\n* list',
					type: 'string'
				},
				{
					default: '',
					key: 'item',
					prompt: 'channel id or message number',
					type: 'channel|integer'
				},
				{
					default: '',
					key: 'text',
					prompt: 'text',
					type: 'string'
				}
			],
			description: 'Used to configure the Terms of Service for a guild.',
			details: oneLine`
				syntax: \`!tos(channel|title|body|list) [channel mention | message number][text]\n
				\n
				\`channel mention\` - Sets the channel to display the terms of service in.\n
				\`title (info block number) (text)\` - Edit the title of a terms of service info block.\n
				\`body (info block number) (text)\` - Edit the body of a terms of service info block.\n
				\`list\` - returns all the terms of service info blocks.\n
				\n
				Manage Guild permission required.')`,
			examples: [
				'!tos channel #channelMention',
				'!tos title 1 Interesting title',
				'!tos body 1 Interesting body text',
				'!tos list'
			],
			group: 'util',
			guildOnly: true,
			memberName: 'tos',
			name: 'tos',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Determine if a member has permission to run the "accept" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {boolean}
	 * @memberof TermsOfServiceCommand
	 */
	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_GUILD');
	}

	/**
	 * Run the "tos" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof TermsOfServiceCommand
	 */
	public async run(msg: CommandMessage, args: { arg1: string, item: Channel | number, text: string }): Promise<Message | Message[]> {
		const tosEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			author: {
				name: 'Terms of Service',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png'
			}
		});

		const tosChannel: string = await msg.client.provider.get(msg.guild, 'tosChannel');
		const tosMessageCount: number = await msg.client.provider.get(msg.guild, 'tosMessageCount') || 0;
		const tosMessages: ITOSMessage[] = [];

		for (let i = 1; i < tosMessageCount + 1; i++) {
			const tosMessage: ITOSMessage = await msg.client.provider.get(msg.guild, `tosMessage${i}`);
			if (tosMessage) {
				tosMessages.push(tosMessage);
			}
		}
		let message: ITOSMessage;

		switch (args.arg1.toLowerCase()) {
			case 'channel':
				const channel = args.item as Channel;
				if (tosChannel && tosChannel === channel.id) {
					tosEmbed.description = `Terms of Service channel already set to <#${msg.channel.id}>!`;
					return msg.embed(tosEmbed);
				} else {
					return msg.client.provider.set(msg.guild, 'tosChannel', channel.id)
						.then(() => {
							tosEmbed.description = `Terms of Service channel set to <#${(args.item as Channel).id}>.`;
							return msg.embed(tosEmbed);
						})
						.catch((context) => {
							msg.client.emit('error', `Unsuccessful database request.\nCommand: 'tos'\nContext: ${context}`);
							return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
						});
				}
			case 'list':
				tosEmbed.description = '';
				tosMessages.map((message, index) => {
					tosEmbed.description += `${index + 1} - ${message.title}\n`;
				});
				return msg.embed(tosEmbed);
			case 'title':
				let item: number = +args.item;
				let tosEmbedUpsertMessage = 'updated';
				message = tosMessages[item - 1];
				if (!isNaN(Number(item)) && Number.isInteger(Number(item)) && item > 0 && args.text.length > 0) {
					if (args.item === tosMessageCount + 1) {
						tosEmbedUpsertMessage = 'added';
					} else if (args.item > tosMessageCount + 2) {
						return sendSimpleEmbeddedError(msg, 'You must supply either an already existing message number or one greater than the current count.', 3000);
					}

					if (!message) {
						message = {
							id: item - 1,
							title: '',
							body: ''
						};
						tosMessages.push(message);
					}

				} else {
					if (tosChannel && tosChannel === msg.channel.id) {
						if (tosMessages && tosMessages.length > 0) {
							const tosEmbeds = tosMessages.map((message) => {
								tosEmbed.author.name = message.title;
								tosEmbed.author.iconURL = undefined;
								tosEmbed.description = message.body;

								return msg.embed(tosEmbed);
							});

							return tosEmbeds[0]; // I don't like this...
						} else {
							tosEmbed.description = 'There are no terms of service messages set.';
							return msg.embed(tosEmbed);
						}
					} else {
						return msg.delete();
					}
				}
				message.title = args.text;
				return msg.client.provider.set(msg.guild, `tosMessage${item}`, message)
					.then(async () => {
						tosEmbed.description = `Terms of Service message #${item} ${tosEmbedUpsertMessage}.`;

						await msg.client.provider.set(msg.guild, 'tosMessageCount', tosMessages.length)
							.catch((context) => {
								msg.client.emit('error', `Unsuccessful database request.\nCommand: 'tos'\nContext: ${context}`);
							});

						return msg.embed(tosEmbed);
					})
					.catch((context) => {
						msg.client.emit('error', `Unsuccessful database request.\nCommand: 'tos'\nContext: ${context}`);
						return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
					});
			case 'body':
				item = +args.item;
				tosEmbedUpsertMessage = 'updated';
				message = tosMessages[item - 1];
				if (args.arg1.length > 0 && !isNaN(Number(args.item)) && Number.isInteger(Number(args.item)) && args.item > 0 && args.text.length > 0) {
					if (args.item === tosMessageCount + 1) {
						tosEmbedUpsertMessage = 'added';
					} else if (args.item > tosMessageCount + 2) {
						return sendSimpleEmbeddedError(msg, 'You must supply either an already existing message number or one greater than the current count.', 3000);
					}
					if (!message) {
						message = {
							id: item - 1,
							title: '',
							body: ''
						};
						tosMessages.push(message);
					}

				} else {
					if (tosChannel && tosChannel === msg.channel.id) {
						if (tosMessages && tosMessages.length > 0) {
							const tosEmbeds = tosMessages.map((message) => {
								tosEmbed.author.name = message.title;
								tosEmbed.author.iconURL = undefined;
								tosEmbed.description = message.body;

								return msg.embed(tosEmbed);
							});

							return tosEmbeds[0]; // I don't like this...
						} else {
							tosEmbed.description = 'There are no terms of service messages set.';
							return msg.embed(tosEmbed);
						}
					} else {
						return msg.delete();
					}
				}
				message.body = args.text;
				return msg.client.provider.set(msg.guild, `tosMessage${args.item}`, message)
					.then(async () => {
						tosEmbed.description = `Terms of Service message #${args.item} ${tosEmbedUpsertMessage}.`;
						await msg.client.provider.set(msg.guild, 'tosMessageCount', tosMessages.length)
							.catch((context) => {
								msg.client.emit('error', `Unsuccessful database request.\nCommand: 'tos'\nContext: ${context}`);
							});

						return msg.embed(tosEmbed);
					})
					.catch((context) => {
						msg.client.emit('error', `Unsuccessful database request.\nCommand: 'tos'\nContext: ${context}`);
						return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
					});
			default:
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}
}

interface ITOSMessage {
	id: number;
	title: string;
	body: string;
}
