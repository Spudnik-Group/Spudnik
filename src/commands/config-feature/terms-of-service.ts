/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandStore, KlasaMessage, Possible, Timestamp } from 'klasa';
import { GuildSettings, TosMessage } from '@lib/types/settings/GuildSettings';
import { resolveChannel, escapeMarkdown } from '@lib/helpers/base';
import { getEmbedColor, modLogMessage } from '@lib/helpers/custom-helpers';

/**
 * Sets/Shows the terms of service for a guild.
 *
 * @export
 * @class TermsOfServiceCommand
 * @extends {Command}
 */
export default class TermsOfServiceCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
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
			usage: '<channel|title|body|get|list|status> (item:item) (text:text)'
		});

		this
			.createCustomResolver('item', (arg: string, possible: Possible, message: KlasaMessage, [subCommand]: [string]) => {
				if (subCommand.toLocaleLowerCase() === 'channel' && (!arg || !message.guild.channels.get(resolveChannel(arg)))) throw 'Please provide a channel for the TOS message to be displayed in.';

				if (['title', 'body'].includes(subCommand.toLocaleLowerCase()) && !arg) throw 'Please include the index of the TOS message you would like to update.';
				if (subCommand.toLocaleLowerCase() === 'get' && !arg) throw 'Please include the index of the TOS message you would like to view.';
				if (['title', 'body', 'get'].includes(subCommand)) {
					if(!Number(arg)) throw 'ID must be an integer.';
					else if (Number(arg) < 1) throw 'ID must be a positive integer.'
				}

				return arg;
			})
			.createCustomResolver('text', (arg: string, possible: Possible, message: KlasaMessage, [subCommand]: [string]) => {
				if (['title', 'body'].includes(subCommand.toLocaleLowerCase()) && !arg) throw 'Please include the new text.';
				if (subCommand.toLocaleLowerCase() === 'get' && !['true', 'false', 't', 'f', '1', '0', undefined].includes(arg.toLocaleLowerCase())) throw 'Please supply a valid boolean option for `raw` option.';
				if (subCommand.toLocaleLowerCase() === 'get' && ['true', 't', '1'].includes(arg.toLocaleLowerCase())) return 'raw';

				// Check text length against Discord embed limits
				if (subCommand.toLocaleLowerCase() === 'title' && arg.length > 256) throw 'Discord message embed titles are limited to 256 characters; please supply a shorter title.';
				if (subCommand.toLocaleLowerCase() === 'body' && arg.length > 2048) throw 'Discord message embed bodies are limited to 2048 characters; please supply a shorter body.';

				return arg;
			});
	}

	public async channel(msg: KlasaMessage, [item]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Terms of Service'
			},
			color: getEmbedColor(msg)
		});
		const tosChannel: string = msg.guild.settings.get(GuildSettings.Tos.Channel);
		const newTosChannel = msg.guild.channels.get(resolveChannel(item));

		if (tosChannel && newTosChannel && tosChannel === newTosChannel.id) {
			return msg.sendSimpleEmbed(`Terms of Service channel already set to ${item}.`);
		}
		try {
			await msg.guild.settings.update(GuildSettings.Tos.Channel, newTosChannel.id);

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

	public async title(msg: KlasaMessage, [item, ...text]: [string, string[]]): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Terms of Service'
			},
			color: getEmbedColor(msg)
		});

		const tosMessages = msg.guild.settings.get(GuildSettings.Tos.Messages);
		let existingTosMessage = tosMessages.find((message: TosMessage) => {
			if (Number(message.id) === Number(item)) {
				return true;
			}

			return false;
		});

		const tosEmbedUpsertMessage = existingTosMessage ? 'updated' : 'added';

		if (existingTosMessage) {
			existingTosMessage.title = text.join();
		} else {
			existingTosMessage = {
				body: '',
				id: Number(item),
				title: text.join()
			};
		}

		try {
			await msg.guild.settings.update(GuildSettings.Tos.Messages, existingTosMessage, { arrayAction: 'add' });

			tosEmbed
				.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Terms of Service message #${item} ${tosEmbedUpsertMessage}.
				`)
				.setFooter('Use the `tos status` command to see the details of this feature')
				.setTimestamp();

			return this.sendSuccess(msg, tosEmbed);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'title', item, text: text.join() }, err);
		}
	}

	public async body(msg: KlasaMessage, [item, ...text]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Terms of Service'
			},
			color: getEmbedColor(msg)
		});

		const tosMessages = msg.guild.settings.get(GuildSettings.Tos.Messages);
		let existingTosMessage = tosMessages.find((message: TosMessage) => {
			if (Number(message.id) === Number(item)) {
				return true;
			}

			return false;
		});

		const tosEmbedUpsertMessage = existingTosMessage ? 'updated' : 'added';

		if (existingTosMessage) {
			existingTosMessage.body = text.join();
		} else {
			existingTosMessage = {
				body: text.join(),
				id: Number(item),
				title: ''
			};
		}

		try {
			await msg.guild.settings.update(GuildSettings.Tos.Messages, existingTosMessage, { arrayAction: 'add' });

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

	public async get(msg: KlasaMessage, [item, ...text]: string[]): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Terms of Service'
			},
			color: getEmbedColor(msg)
		});
		const tosMessage = msg.guild.settings.get(GuildSettings.Tos.Messages).find((message: TosMessage) => {
			if (Number(message.id) === Number(item)) {
				return true;
			}

			return false;
		});

		if (tosMessage) {
			tosEmbed
				.setDescription(stripIndents`
					**ID:** ${tosMessage.id}
					**Title:** ${tosMessage.title}
					**Body (${(text.toString().toLowerCase() === 'raw') ? 'raw' : 'formatted'}):** ${(text.toString().toLowerCase() === 'raw') ? escapeMarkdown(tosMessage.body.toString(), false, false) : tosMessage.body.toString()}
				`)
				.setFooter('Use the `tos status` command to see the details of this feature')
				.setTimestamp();

			return this.sendSuccess(msg, tosEmbed);
		} else {
			return msg.sendSimpleError(`No terms of service message found matching ID of \`${item}\`.`);
		}

	}

	public async list(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Terms of Service'
			},
			color: getEmbedColor(msg)
		});
		const tosChannel = msg.guild.settings.get(GuildSettings.Tos.Channel);
		const tosMessages = msg.guild.settings.get(GuildSettings.Tos.Messages).sort((a: TosMessage, b: TosMessage) => a.id - b.id);

		if (tosChannel && tosChannel === msg.channel.id) {
			if (tosMessages && tosMessages.length > 0) {
				tosMessages.forEach((message: TosMessage) => {
					tosEmbed.author.name = `${message.title}`;
					tosEmbed.description = `${message.body}`;

					return msg.sendEmbed(tosEmbed);
				});
			} else {
				return msg.sendSimpleError('There are no terms of service messages set.');
			}
		}
	}

	public async status(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Terms of Service'
			},
			color: getEmbedColor(msg)
		});
		const tosChannel = msg.guild.settings.get(GuildSettings.Tos.Channel);
		const defaultRole = msg.guild.settings.get(GuildSettings.Roles.Default);
		const tosMessages = msg.guild.settings.get(GuildSettings.Tos.Messages).sort((a: TosMessage, b: TosMessage) => a.id - b.id);

		tosEmbed.description = `Channel: ${tosChannel ? `<#${tosChannel}>` : 'None set.'}\nDefault role: ${defaultRole ? `<@${defaultRole}>` : 'None set.'}\nMessage List:\n`;

		if (tosMessages.length) {
			let tosList = '';

			tosMessages.forEach((message: TosMessage) => {
				tosList += `${message.id} - ${message.title}\n`;
			});
			// TODO: change this to better output messages, this could overload the embed character limit
			tosEmbed.description += `\`\`\`${tosList}\`\`\``;
		} else {
			tosEmbed.description += 'No Messages.';
		}
		tosEmbed.setFooter('Use the `tos get` command to see the full message content');

		return msg.sendEmbed(tosEmbed);
	}

	private catchError(msg: KlasaMessage, args: { subCommand: string; item: any; text?: string; raw?: string }, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Build warning message
		let tosWarn = stripIndents`
			Error occurred in \`tos\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
			**Input:** \`TOS ${args.subCommand.toLowerCase()}\`
		`;
		let tosUserWarn = '';

		switch (args.subCommand.toLowerCase()) {
			case 'get': {
				tosUserWarn = `Failed getting tos message #${args.item}`;
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
		return msg.sendSimpleError(tosUserWarn);
	}

	private async sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		await modLogMessage(msg, embed);

		// Send the success response
		return msg.sendEmbed(embed);
	}

}
