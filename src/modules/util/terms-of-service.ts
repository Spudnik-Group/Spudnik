import { Channel, Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, sendSimpleEmbeddedSuccess } from '../../lib/helpers';

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
			description: 'Sets the terms of service for a guild.\nSets the channel to display the terms of service in.\nGuides a user to the specific channel that the terms of server are in.',
			group: 'util',
			guildOnly: true,
			memberName: 'tos',
			name: 'tos',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'arg1',
					prompt: 'Please provide a channel or subcommand (text|body).',
					type: 'channel|string',
					default: '',
				},
				{
					default: '',
					key: 'messageNumber',
					prompt: 'message number',
					type: 'integer',
				},
				{
					default: '',
					key: 'text',
					prompt: 'text',
					type: 'string',
				},
			],
		});
	}

	/**
	 * Run the "tos" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof TermsOfServiceCommand
	 */
	public async run(msg: CommandMessage, args: { arg1: Channel | string, messageNumber: number, text: string }): Promise<Message | Message[]> {
		const tosEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			author: {
				name: 'Terms of Service',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
			},
		});

		const tosChannel: string = await msg.client.provider.get(msg.guild, 'tosChannel');
		const tosMessageCount: number = await msg.client.provider.get(msg.guild, 'tosMessageCount') || 0;
		let tosMessages: ITOSMessage[] = [];

		for (let i = 1; i < tosMessageCount + 1; i++) {
			const tosMessage: ITOSMessage = await msg.client.provider.get(msg.guild, `tosMessage${i}`);
			if (tosMessage) {
				tosMessages.push(tosMessage);
			}
		}

		if (args.arg1 instanceof Channel) {
			if (tosChannel && tosChannel === (args.arg1 as Channel).id) {
				tosEmbed.description = `Terms of Service channel already set to <#${msg.channel.id}>!`;
				return msg.embed(tosEmbed);
			} else {
				return msg.client.provider.set(msg.guild, 'tosChannel', args.arg1.id).then(() => {
					tosEmbed.description = `Terms of Service channel set to <#${(args.arg1 as Channel).id}>.`;
					return msg.embed(tosEmbed);
				}).catch(() => {
					tosEmbed.description = 'There was an error processing the request.';
					return msg.embed(tosEmbed);
				});
			}
		} else if (args.arg1.toLowerCase() === 'list') {
			tosEmbed.description = '';

			tosMessages.map((message, index) => {
				tosEmbed.description += `${index + 1} - ${message.title}\n`;
			});

			return msg.embed(tosEmbed);
		} else if (args.arg1.length > 0 && !isNaN(Number(args.messageNumber)) && Number.isInteger(Number(args.messageNumber)) && args.messageNumber > 0 && args.text.length > 0) {
			let tosEmbedUpsertMessage = 'updated';
			if (args.messageNumber === tosMessageCount + 1) {
				tosEmbedUpsertMessage = 'added';
			} else if (args.messageNumber > tosMessageCount + 2) {
				tosEmbed.description = 'You must supply either an already existing message number or one greater than the current count.';
				return msg.embed(tosEmbed);
			}

			let message: ITOSMessage = tosMessages[args.messageNumber - 1];
			if (!message) {
				message = {
					id: args.messageNumber - 1,
					title: '',
					body: '',
				};
				tosMessages.push(message);
			}

			switch (args.arg1.toLowerCase()) {
				case 'title':
					message.title = args.text;
					return msg.client.provider.set(msg.guild, `tosMessage${args.messageNumber}`, message).then(async () => {
						tosEmbed.description = `Terms of Service message #${args.messageNumber} ${tosEmbedUpsertMessage}.`;

						await msg.client.provider.set(msg.guild, 'tosMessageCount', tosMessages.length).catch((context) => {
							msg.client.emit('error', `Unsuccessful database request.\nCommand: 'tos'\nContext: ${context}`);
						});

						return msg.embed(tosEmbed);
					}).catch(() => {
						tosEmbed.description = 'There was an error processing the request.';
						return msg.embed(tosEmbed);
					});
				case 'body':
					message.body = args.text;
					return msg.client.provider.set(msg.guild, `tosMessage${args.messageNumber}`, message).then(async () => {
						tosEmbed.description = `Terms of Service message #${args.messageNumber} ${tosEmbedUpsertMessage}.`;

						await msg.client.provider.set(msg.guild, 'tosMessageCount', tosMessages.length).catch((context) => {
							msg.client.emit('error', `Unsuccessful database request.\nCommand: 'tos'\nContext: ${context}`);
						});

						return msg.embed(tosEmbed);
					}).catch(() => {
						tosEmbed.description = 'There was an error processing the request.';
						return msg.embed(tosEmbed);
					});
				default:
					return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?');
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
	}
}

interface ITOSMessage {
	id: number;
	title: string;
	body: string;
}
