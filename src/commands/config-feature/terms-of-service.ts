/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandStore, KlasaMessage, Possible, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { resolveChannel, escapeMarkdown } from '@lib/helpers/base';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';
import { ITOSMessage } from '@lib/interfaces/tos-message';

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
			aliases: ['tos'],
			description: 'Used to configure the Terms of Service for a guild.',
			extendedHelp: stripIndents`
				**Subcommand Usage**:
				\`channel <#channelMention>\` - set the channel to display the terms of service in.
				\`title <info block number> <text>\` - edit the title of a terms of service info block.
				\`body <info block number> <text>\` - edit the body of a terms of service info block.
				\`get <info block number> (raw:boolean)\` - returns the requested block number.
				\`list\` - return all the terms of service embedded blocks.
				\`status\` - return the terms of service feature configuration details.
				\`welcome enabled <boolean>\` - enable/disable terms of service welcome message.
				\`welcome message <text>\` - set the welcome text to prompt users to accept the terms of service.
			`,
			permissionLevel: 6, // MANAGE_GUILD
			subcommands: true,
			usage: '<channel|title|body|get|welcome|list|status> (item:item) [text:string] [...]'
		});

		this.createCustomResolver('item', (arg: string, possible: Possible, message: KlasaMessage, [subCommand]: [string]) => {
			if (subCommand === 'channel' && (!arg || !message.guild.channels.get(resolveChannel(arg)))) throw 'Please provide a channel for the TOS message to be displayed in.';

			if (['title', 'body'].includes(subCommand) && !arg) throw 'Please include the index of the TOS message you would like to update.';
			if (subCommand === 'get' && !arg) throw 'Please include the index of the TOS message you would like to view.';
			if (['title', 'body', 'get'].includes(subCommand)) {
				if (!Number(arg)) throw 'ID must be an integer.';
				else if (Number(arg) < 1) throw 'ID must be a positive integer.';
			}

			if (subCommand === 'welcome' && !arg) throw 'Insufficent parameters, run `help tos` for details.';
			if (subCommand === 'welcome' && !['enabled', 'message'].includes(arg)) throw 'Invalid subcommand for `tos welcome`.';

			return arg;
		});
	}

	public async channel(msg: KlasaMessage, [item]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Tos);
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
				.setFooter('Use the `tos status` command to see the details of this feature');

			return this.sendSuccess(msg, tosEmbed);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'channel', item }, err);
		}

	}

	public async title(msg: KlasaMessage, [item, ...text]: [string, string[]]): Promise<KlasaMessage | KlasaMessage[]> {
		const updatedText = text.join(' ');

		if (!updatedText) {
			return msg.sendSimpleError(`Please include the new text.`);
		} else if (updatedText.length > 256) {
			return msg.sendSimpleError('Discord message embed titles are limited to 256 characters; please supply a shorter title.');
		}

		const tosMessages = msg.guild.settings.get(GuildSettings.Tos.Messages);
		let existingTosMessage = tosMessages.find((message: ITOSMessage) => {
			if (Number(message.id) === Number(item)) {
				return true;
			}

			return false;
		});

		if (existingTosMessage) {
			existingTosMessage.title = updatedText;
		} else {
			existingTosMessage = {
				body: '',
				id: Number(item),
				title: updatedText
			};
		}

		try {
			await msg.guild.settings.update(GuildSettings.Tos.Messages, existingTosMessage, { arrayAction: 'overwrite' });

			const tosEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Tos);

			tosEmbed
				.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Terms of Service message #${item} ${existingTosMessage ? 'updated' : 'added'}.
				`)
				.setFooter('Use the `tos status` command to see the details of this feature');

			return this.sendSuccess(msg, tosEmbed);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'title', item, text: updatedText }, err);
		}
	}

	public async body(msg: KlasaMessage, [item, ...text]: [string, string]): Promise<KlasaMessage | KlasaMessage[]> {
		const updatedText = text.join(' ');

		if (!updatedText) {
			return msg.sendSimpleError('Please include the new text.');
		} else if (updatedText.length > 2048) {
			return msg.sendSimpleError('Discord message embed bodies are limited to 2048 characters; please supply a shorter body.');
		}

		const tosMessages = msg.guild.settings.get(GuildSettings.Tos.Messages);
		let existingTosMessage = tosMessages.find((message: ITOSMessage) => {
			if (Number(message.id) === Number(item)) {
				return true;
			}

			return false;
		});

		if (existingTosMessage) {
			existingTosMessage.body = updatedText;
		} else {
			existingTosMessage = {
				body: updatedText,
				id: Number(item),
				title: ''
			};
		}

		try {
			await msg.guild.settings.update(GuildSettings.Tos.Messages, existingTosMessage, { arrayAction: 'overwrite' });

			const tosEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Tos);

			tosEmbed
				.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Terms of Service message #${item} ${existingTosMessage ? 'updated' : 'added'}.
				`)
				.setFooter('Use the `tos status` command to see the details of this feature');

			return this.sendSuccess(msg, tosEmbed);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'title', item, text: updatedText }, err);
		}
	}

	public async get(msg: KlasaMessage, [item, text]: [string, string]): Promise<KlasaMessage | KlasaMessage[]> {
		let raw: boolean = false;

		if (!['true', 'false', 't', 'f', '1', '0', undefined].includes(text)) {
			return msg.sendSimpleError('Please supply a valid boolean option for `raw` option.');
		} else if (['true', 't', '1'].includes(text)) {
			raw = true;
		}

		const tosMessage = msg.guild.settings.get(GuildSettings.Tos.Messages).find((message: ITOSMessage) => (Number(message.id) === Number(item)) ? true : false);

		if (tosMessage) {
			const tosEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Tos);

			tosEmbed
				.setDescription(stripIndents`
					**ID:** ${tosMessage.id}
					**Title:** ${raw ? escapeMarkdown(tosMessage.title!, false, false) : tosMessage.title!}
					**Body (${raw ? 'raw' : 'formatted'}):** ${raw ? escapeMarkdown(tosMessage.body!, false, false) : tosMessage.body!}
				`)
				.setFooter('Use the `tos status` command to see the details of this feature');

			return this.sendSuccess(msg, tosEmbed);
		}

		return msg.sendSimpleError(`No terms of service message found matching ID of \`${item}\`.`);
	}

	public list(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Tos);
		const tosChannel = msg.guild.settings.get(GuildSettings.Tos.Channel);
		const tosMessages = msg.guild.settings.get(GuildSettings.Tos.Messages).sort((a: ITOSMessage, b: ITOSMessage) => a.id - b.id);

		if (tosChannel && tosChannel === msg.channel.id) {
			if (tosMessages && tosMessages.length > 0) {
				tosMessages.forEach((message: ITOSMessage) => {
					tosEmbed.author.name = `${message.title!}`;
					tosEmbed.description = `${message.body!}`;

					return msg.sendEmbed(tosEmbed);
				});
			} else {
				return msg.sendSimpleError('There are no terms of service messages set.');
			}
		}
	}

	public status(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Tos);

		const channel = msg.guild.settings.get(GuildSettings.Tos.Channel);
		const defaultRole = msg.guild.settings.get(GuildSettings.Tos.Role);
		const welcomeEnabled = msg.guild.settings.get(GuildSettings.Tos.Welcome.Enabled);
		const welcomeMessage = msg.guild.settings.get(GuildSettings.Tos.Welcome.Message);
		const tosMessages = msg.guild.settings.get(GuildSettings.Tos.Messages).sort((a: ITOSMessage, b: ITOSMessage) => a.id - b.id);

		tosEmbed.description = stripIndents`
			Channel: ${channel ? `<#${channel}>` : 'None set.'}
			Default (TOS) Role: ${defaultRole ? `<@&${defaultRole}>` : 'None set.'}
			Welcome Message (${welcomeEnabled ? 'Enabled' : 'Disabled'}): ${welcomeMessage}
			
			Message List:\n`;

		if (tosMessages.length) {
			let tosList = '';

			tosMessages.forEach((message: ITOSMessage) => {
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

	public async welcome(msg: KlasaMessage, [item, ...text]: [string, string[]]): Promise<KlasaMessage | KlasaMessage[]> {
		const tosEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Tos);

		const updatedText = text.join(' ');

		if (item === 'message') {
			try {
				if (!text) {
					return msg.sendSimpleError('Please include the new text.');
				} else if (updatedText.length > 2048) {
					return msg.sendSimpleError('Discord message embed bodies are limited to 2048 characters; please supply a shorter body.');
				} else if (((updatedText.replace('{user}', '').length)) > 2048) {
					return msg.sendSimpleError('Discord message embed bodies are limited to 2048 characters; please supply a shorter body.');
				}

				await msg.guild.settings.update(GuildSettings.Tos.Welcome.Message, updatedText);

				tosEmbed
					.setDescription(stripIndents`
							**Member:** ${msg.author.tag} (${msg.author.id})
							**Action:** Terms of Service Welcome Message set to:\n
							${updatedText}
						`)
					.setFooter('Use the `tos status` command to see the details of this feature');

				return this.sendSuccess(msg, tosEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'welcome', item }, err);
			}
		} else if (item === 'enabled') {
			try {
				const value = ['true', 't', '1'].includes(updatedText) ? true : false;

				await msg.guild.settings.update(GuildSettings.Tos.Welcome.Enabled, value);

				tosEmbed
					.setDescription(stripIndents`
							**Member:** ${msg.author.tag} (${msg.author.id})
							**Action:** Terms of Service Welcome ${value ? 'Enabled' : 'Disabled'}
						`)
					.setFooter('Use the `tos status` command to see the details of this feature');

				return this.sendSuccess(msg, tosEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'welcome', item }, err);
			}
		}

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
			case 'get':
			{
				tosUserWarn = `Failed getting tos message #${args.item}`;
				break;
			}
			case 'channel':
			{
				tosUserWarn = `Failed setting new tos channel to <#${args.item}>!`;
				break;
			}
			case 'title':
			case 'body':
			{
				tosUserWarn = `Failed setting tos message #${args.item}!`;
				break;
			}
			case 'welcome':
			{
				tosUserWarn = `Failed updating tos welcome value.`;
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
