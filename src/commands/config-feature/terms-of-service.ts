import { stripIndents } from 'common-tags';
import { Channel, MessageEmbed } from 'discord.js';
import { getEmbedColor, modLogMessage, sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, resolveChannel } from '../../lib/helpers';
import * as format from 'date-fns/format';
import { Command, KlasaClient, CommandStore, KlasaMessage, Possible } from 'klasa';
// import * as markdownescape from 'markdown-escape';
import { ITOSMessage } from '../../lib/interfaces';

/**
 * Sets/Shows the terms of service for a guild.
 *
 * @export
 * @class TermsOfServiceCommand
 * @extends {Command}
 */
export default class TermsOfServiceCommand extends Command {

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Used to configure the Terms of Service for a guild.',
			extendedHelp: stripIndents`
				**Subcommand Usage**:
				\`channel <#channelMention>\` - set the channel to display the terms of service in.
				\`title <info block number> <text>\` - edit the title of a terms of service info block.
				\`body <info block number> <text>\` - edit the body of a terms of service info block.
				\`get <info block number> (raw:boolean)\` - returns the requested block number
				\`list\` - return all the terms of service embedded blocks.
				\`status\` - return the terms of service feature configuration details.
			`,
			name: 'tos',
			permissionLevel: 6, // MANAGE_GUILD
			subcommands: true,
			usage: '<channel|title|body|get|list|status> [item:item] [text:...string]'
		});

		this
			.createCustomResolver('item', (arg: string, possible: Possible, message: KlasaMessage, [subCommand]) => {
				if (subCommand === 'channel' && (!arg || !message.guild.channels.get(resolveChannel(arg)))) throw 'Please provide a channel for the TOS message to be displayed in.';
				if (['title', 'body'].includes(subCommand) && !arg) throw 'Please include the index of the TOS message you would like to update.';
				if (subCommand === 'get' && !arg) throw 'Please include the index of the TOS message you would like to view.';

				return arg;
			})
			.createCustomResolver('text', (arg: string, possible: Possible, message: KlasaMessage, [subCommand]) => {
				if (['title', 'body'].includes(subCommand) && !arg) throw 'Please include the new text.';
				if (subCommand === 'get' && (['true', 'false', 't', 'f'].includes(arg))) throw 'Please supply a valid boolean option for `raw` option.';

				// Check text length against Discord embed limits
				if (subCommand === 'title' && arg.length > 256) throw 'Discord message embed titles are limited to 256 characters; please supply a shorter title.';
				if (subCommand === 'body' && arg.length > 2048) throw 'Discord message embed bodies are limited to 2048 characters; please supply a shorter body.';

				return arg;
			});
	}

	public async channel(msg: KlasaMessage, [item]): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Terms of Service'
			},
			color: getEmbedColor(msg)
		});
		const tosChannel: string = await msg.guild.settings.get('tos.channel');
		const newTosChannel = msg.guild.channels.get(resolveChannel(item));

		if (tosChannel && newTosChannel && tosChannel === newTosChannel.id) {
			return sendSimpleEmbeddedMessage(msg, `Terms of Service channel already set to ${item}!`, 3000);
		} else {
			try {
				await msg.guild.settings.update('tos.channel', newTosChannel.id, msg.guild);

				// Set up embed message
				tosEmbed
					.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Terms of Service Channel set to <#${newTosChannel.id}>
					`)
					.setFooter('Use the `tos status` command to see the details of this feature')
					.setTimestamp();

				return this.sendSuccess(msg, tosEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'channel', item }, err);
			}
		}
	}

	public async title(msg: KlasaMessage, [item, ...text]): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Terms of Service'
			},
			color: getEmbedColor(msg)
		});
		let itemIndex: number = null;
		const tosMessages = await msg.guild.settings.get('tos.messages');
		let existingTosMessage = tosMessages.find((message, index) => {
			if(Number(message.id) === Number(item)){
				itemIndex = index;
				return true;
			}

			return false;
		});

		console.log(`item index ${itemIndex}`);

		const tosEmbedUpsertMessage = existingTosMessage ? 'updated' : 'added';

		if (existingTosMessage) {
			try {
				existingTosMessage.title = text;

				await msg.guild.settings.update('tos.messages', existingTosMessage, null, { arrayPosition: itemIndex });

				tosEmbed
					.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Terms of Service message #${item} ${tosEmbedUpsertMessage}.
					`)
					.setFooter('Use the `tos status` command to see the details of this feature')
					.setTimestamp();

				return this.sendSuccess(msg, tosEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'title', item, ...text }, err);
			}
		} else {
			// TODO: enforce that "item" is the next index of the array of TOS messages
			existingTosMessage = {
				title: text,
				id: item,
				body: ''
			}

			try {
				await msg.guild.settings.update('tos.messages', existingTosMessage, null, { arrayPosition: itemIndex });
				
				tosEmbed
					.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Terms of Service message #${item} ${tosEmbedUpsertMessage}.
					`)
					.setFooter('Use the `tos status` command to see the details of this feature')
					.setTimestamp();

				return this.sendSuccess(msg, tosEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'title', item, ...text }, err);
			}
		}
	}

	public async body(msg: KlasaMessage, [item, ...text]): Promise<KlasaMessage | KlasaMessage[]> {
		return null;
	}

	public async get(msg: KlasaMessage, [item, ...text]): Promise<KlasaMessage | KlasaMessage[]> {
		return null;
	}

	public async list(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Terms of Service'
			},
			color: getEmbedColor(msg)
		});
		const tosChannel: string = await msg.guild.settings.get('tos.channel');
		const tosMessages: ITOSMessage[] = await msg.guild.settings.get('tos.messages');

		if (tosChannel && tosChannel === msg.channel.id) {
			if (tosMessages && tosMessages.length) {
				tosMessages.forEach((message) => {
					tosEmbed.author.name = message.title;
					tosEmbed.author.iconURL = undefined;
					tosEmbed.description = message.body;

					return msg.sendEmbed(tosEmbed);
				});
			} else {
				return sendSimpleEmbeddedError(msg, 'There are no terms of service messages set.', 3000);
			}
		}
	}

	/**
	 * Run the "tos" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ subCommand: string, item: Channel | number, text: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof TermsOfServiceCommand
	 */
	public async status(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Terms of Service'
			},
			color: getEmbedColor(msg)
		});
		const tosChannel: string = await msg.guild.settings.get('tos.channel');
		const tosMessages = await msg.guild.settings.get('tos.messages');
		console.log(tosMessages);

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
		tosEmbed.setFooter('Use the `tos get` command to see the full message content')

		// Send the success response
		return msg.sendEmbed(tosEmbed);
	}

	private catchError(msg: KlasaMessage, args: { subCommand: string, item: Channel | number, text?: string, raw?: string }, err: Error) {
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
			case 'get': {
				tosUserWarn = `Failed getting tos message #${args.item}`
				break;
			}
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

		// Emit warn event for debugging
		msg.client.emit('warn', tosWarn);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, tosUserWarn);
	}

	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		modLogMessage(msg, embed);
		// Send the success response
		return msg.sendEmbed(embed);
	}
}
