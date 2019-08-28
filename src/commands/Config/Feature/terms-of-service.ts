import { stripIndents } from 'common-tags';
import { Channel, Message, MessageEmbed } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, stopTyping, startTyping } from '../../lib/helpers';
import * as format from 'date-fns/format';

interface ITOSMessage {
	id: number;
	title: string;
	body: string;
}

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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			args: [
				{
					key: 'subCommand',
					prompt: 'What sub-command would you like to use?\nOptions are:\n* channel\n* title\n* body\n* list\n* status',
					type: 'string',
					validate: (subCommand: string) => {
						const allowedSubcommands = ['channel', 'title', 'body', 'list', 'status'];
						if (allowedSubcommands.indexOf(subCommand) !== -1) return true
						
						return 'You provided an invalid subcommand.';
					}
				},
				{
					default: '',
					key: 'item',
					prompt: '#channelMention or message number',
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
			details: stripIndents`
				syntax: \`!tos (channel|title|body|list|status) (#channelMention | message number) (text)\`

				\`channel <#channelMention>\` - set the channel to display the terms of service in.
				\`title <info block number> <text>\` - edit the title of a terms of service info block.
				\`body <info block number> <text>\` - edit the body of a terms of service info block.
				\`list\` - return all the terms of service embedded blocks.
				\`status\` - return the terms of service feature configuration details.

				\`MANAGE_GUILD\` permission required.`,
			examples: [
				'!tos channel #rules',
				'!tos title 1 Interesting title',
				'!tos body 1 Interesting body text',
				'!tos list',
				'!tos status'
			],
			group: 'feature',
			guildOnly: true,
			memberName: 'tos',
			name: 'tos',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['MANAGE_GUILD']
		});
	}

	/**
	 * Run the "tos" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ subCommand: string, item: Channel | number, text: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof TermsOfServiceCommand
	 */
	public async run(msg: KlasaMessage, args: { subCommand: string, item: Channel | number, text: string }): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Terms of Service'
			},
			color: getEmbedColor(msg)
		});

		startTyping(msg);

		switch (args.subCommand.toLowerCase()) {
			case 'channel': {
				const tosChannel: string = await msg.guild.settings.get('tosChannel', null);
				if (args.item instanceof Channel) {
					const channelID = (args.item as Channel).id;
					if (tosChannel && tosChannel === channelID) {
						stopTyping(msg);

						return sendSimpleEmbeddedMessage(msg, `Terms of Service channel already set to <#${channelID}>!`, 3000);
					} else {
						try {
							await msg.guild.settings.set('tosChannel', channelID);
							// Set up embed message
							tosEmbed
								.setDescription(stripIndents`
									**Member:** ${msg.author.tag} (${msg.author.id})
									**Action:** Terms of Service Channel set to <#${channelID}>
								`)
								.setFooter('Use the `tos status` command to see the details of this feature')
								.setTimestamp();

							return this.sendSuccess(msg, tosEmbed);
						} catch (err) {
							return this.catchError(msg, args, err);
						}
					}
				} else {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, 'Invalid channel provided.', 3000);
				}
			}
			case 'list': {
				const tosChannel: string = await msg.guild.settings.get('tosChannel', null);
				const tosMessageCount: number = await msg.guild.settings.get('tosMessageCount', 0);
				const tosMessages: ITOSMessage[] = [];
				for (let i = 1; i < tosMessageCount + 1; i++) {
					const tosMessage: ITOSMessage = await msg.guild.settings.get(`tosMessage${i}`);
					if (tosMessage) {
						tosMessages.push(tosMessage);
					}
				}
				if (tosChannel && tosChannel === msg.channel.id) {
					if (tosMessages && tosMessages.length) {
						tosMessages.forEach((message) => {
							tosEmbed.author.name = message.title;
							tosEmbed.author.iconURL = undefined;
							tosEmbed.description = message.body;
	
							return msg.embed(tosEmbed);
						});
						stopTyping(msg);
					} else {
						stopTyping(msg);

						return sendSimpleEmbeddedError(msg, 'There are no terms of service messages set.', 3000);
					}
				}
				break;
			}
			case 'title': {
				const tosMessageCount: number = await msg.guild.settings.get('tosMessageCount', 0);
				const tosMessages: ITOSMessage[] = [];
				for (let i = 1; i < tosMessageCount + 1; i++) {
					const tosMessage: ITOSMessage = await msg.guild.settings.get(`tosMessage${i}`);
					if (tosMessage) {
						tosMessages.push(tosMessage);
					}
				}
				let message: ITOSMessage;
				let item: Channel | number = args.item;
				let tosEmbedUpsertMessage = 'updated';
				item = Number(args.item);
				message = tosMessages[item - 1];
				if (Number.isInteger(item) && args.text.length) {
					if (args.item === tosMessageCount + 1) {
						tosEmbedUpsertMessage = 'added';
					} else if (args.item > tosMessageCount + 2) {
						stopTyping(msg);

						return sendSimpleEmbeddedError(msg, 'You must supply either an already existing message number or one greater than the current count.', 3000);
					}

					if (!message) {
						message = {
							body: '',
							id: item - 1,
							title: ''
						}
						tosMessages.push(message);
					}
				}
				message.title = args.text;
				try {
					await msg.guild.settings.set(`tosMessage${item}`, message);
					tosEmbed
						.setDescription(stripIndents`
							**Member:** ${msg.author.tag} (${msg.author.id})
							**Action:** Terms of Service message #${item} ${tosEmbedUpsertMessage}.
						`)
						.setFooter('Use the `tos status` command to see the details of this feature')
						.setTimestamp();

					await msg.guild.settings.set('tosMessageCount', tosMessages.length);

					return this.sendSuccess(msg, tosEmbed);
				} catch (err) {
					return this.catchError(msg, args, err);
				}
			}
			case 'body': {
				// TODO: disallow message bodies with more than the allowed characters for an embed
				const tosMessageCount: number = await msg.guild.settings.get('tosMessageCount', 0);
				const tosMessages: ITOSMessage[] = [];
				for (let i = 1; i < tosMessageCount + 1; i++) {
					const tosMessage: ITOSMessage = await msg.guild.settings.get(`tosMessage${i}`);
					if (tosMessage) {
						tosMessages.push(tosMessage);
					}
				}
				let message: ITOSMessage;
				let item: Channel | number = args.item;
				let tosEmbedUpsertMessage = 'updated';
				item = Number(args.item);
				message = tosMessages[item - 1];
				if (Number.isInteger(item) && args.text.length) {
					if (args.item === tosMessageCount + 1) {
						tosEmbedUpsertMessage = 'added';
					} else if (args.item > tosMessageCount + 2) {
						stopTyping(msg);

						return sendSimpleEmbeddedError(msg, 'You must supply either an already existing message number or one greater than the current count.', 3000);
					}
					if (!message) {
						message = {
							body: '',
							id: item - 1,
							title: ''
						}
						tosMessages.push(message);
					}
				}
				message.body = args.text;
				try {
					await msg.guild.settings.set(`tosMessage${args.item}`, message);
					tosEmbed
						.setDescription(stripIndents`
							**Member:** ${msg.author.tag} (${msg.author.id})
							**Action:** Terms of Service message #${item} ${tosEmbedUpsertMessage}.
						`)
						.setFooter('Use the `tos status` command to see the details of this feature')
						.setTimestamp();
					
					await msg.guild.settings.set('tosMessageCount', tosMessages.length);

					return this.sendSuccess(msg, tosEmbed);
				} catch (err) {
					return this.catchError(msg, args, err);
				}
			}
			case 'status': {
				const tosChannel: string = await msg.guild.settings.get('tosChannel', null);
				const tosMessageCount: number = await msg.guild.settings.get('tosMessageCount', 0);
				const tosMessages: ITOSMessage[] = [];
				for (let i = 1; i < tosMessageCount + 1; i++) {
					const tosMessage: ITOSMessage = await msg.guild.settings.get(`tosMessage${i}`);
					if (tosMessage) {
						tosMessages.push(tosMessage);
					}
				}
				tosEmbed.description = `Channel: ${tosChannel ? `<#${tosChannel}>` : 'None set.'}\nMessage List:\n`;
				if (tosMessages.length) {
					let tosList = '';
					tosMessages.forEach((message, index) => {
						tosList += `${index + 1} - ${message.title}\n`;
					});
					// TODO: change this to better output messages, this could overload the embed character limit
					tosEmbed.description += `\`\`\`${tosList}\`\`\``;
				} else {
					tosEmbed.description += 'No Messages.';
				}

				deleteCommandMessages(msg);
				stopTyping(msg);

				// Send the success response
				return msg.embed(tosEmbed);
			}
		}
	}
	
	private catchError(msg: KlasaMessage, args: { subCommand: string, item: Channel | number, text: string }, err: Error) {
		// Build warning message
		let tosWarn = stripIndents`
			Error occurred in \`tos\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`TOS ${args.subCommand.toLowerCase()}\`
		`;
		let tosUserWarn = '';

		switch (args.subCommand.toLowerCase()) {
			case 'channel': {
				tosUserWarn = `Failed setting new tos channel to <#${args.item}>!`;
				break;
			}
			case 'title': {
				tosUserWarn = `Failed setting tos message #${args.item}!`;
				break;
			}
			case 'body': {
				tosUserWarn = `Failed setting tos message #${args.item}!`;
				break;
			}
		}
		tosWarn += stripIndents`
			**Error Message:** ${err}`;
		
		stopTyping(msg);

		// Emit warn event for debugging
		msg.client.emit('warn', tosWarn);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, tosUserWarn);
	}

	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		modLogMessage(msg, embed);
		deleteCommandMessages(msg);
		stopTyping(msg);

		// Send the success response
		return msg.embed(embed);
	}
}