import { stripIndents } from 'common-tags';
import { Channel, MessageEmbed } from 'discord.js';
import { getEmbedColor, modLogMessage, sendSimpleEmbeddedError, resolveChannel, sendSimpleEmbeddedMessage, basicFeatureContent } from '../../lib/helpers';
import * as format from 'date-fns/format';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Manage notifications when someone joins the guild.
 *
 * @export
 * @class WelcomeCommand
 * @extends {Command}
 */
export default class WelcomeCommand extends Command {

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Used to configure the message to be sent when a new user join your guild.',
			extendedHelp: stripIndents`
				**Subcommand Usage**:
				\`status\` - return the welcome feature configuration details.
				\`message (text to welcome/heckle)\` - set the welcome message. Use { guild } for guild name, and { user } to reference the user joining.
				\`channel <#channelMention>\` - set the channel for the welcome message to be displayed.
				\`on\` - enable the welcome message feature.
				\`off\` - disable the welcome message feature.
			`,
			name: 'welcome',
			permissionLevel: 6, // MANAGE_GUILD
			subcommands: true,
			usage: '<message|channel|on|off|status> (content:content)'
		});

		this.createCustomResolver('content', basicFeatureContent);
	}

	public async message(msg: KlasaMessage, [content]): Promise<KlasaMessage | KlasaMessage[]> {
		const welcomeEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
				name: 'Server Welcome Message'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();

		try {
			await msg.guild.settings.update('welcome.message', content, msg.guild);

			// Set up embed message
			welcomeEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Welcome message set to:
						\`\`\`${content}\`\`\`
					`);
			welcomeEmbed.setFooter('Use the `welcome status` command to see the details of this feature');

			return this.sendSuccess(msg, welcomeEmbed);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'message', content }, err);
		}
	}

	public async channel(msg: KlasaMessage, [content]): Promise<KlasaMessage | KlasaMessage[]> {
		const welcomeEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
				name: 'Server Welcome Message'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const welcomeChannel = await msg.guild.settings.get('welcome.channel');
		const channelID = msg.guild.channels.get(resolveChannel(content)).id;

		if (welcomeChannel && welcomeChannel === channelID) {
			return sendSimpleEmbeddedMessage(msg, `Welcome channel already set to <#${channelID}>!`, 3000);
		} else {
			try {
				await msg.guild.settings.update('welcome.channel', channelID, msg.guild);

				// Set up embed message
				welcomeEmbed.setDescription(stripIndents`
							**Member:** ${msg.author.tag} (${msg.author.id})
							**Action:** Welcome Channel set to <#${channelID}>
						`);
				welcomeEmbed.setFooter('Use the `welcome status` command to see the details of this feature');

				return this.sendSuccess(msg, welcomeEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'channel', content }, err);
			}
		}
	}

	public async on(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const welcomeEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
				name: 'Server Welcome Message'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const welcomeChannel = await msg.guild.settings.get('welcome.channel');
		const welcomeEnabled = await msg.guild.settings.get('welcome.enabled');

		if (welcomeChannel) {
			if (welcomeEnabled) {
				return sendSimpleEmbeddedMessage(msg, 'Welcome message already enabled!', 3000);
			} else {
				try {
					await msg.guild.settings.update('welcome.enabled', true, msg.guild);

					// Set up embed message
					welcomeEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Welcome messages set to: _Enabled_
					`);
					welcomeEmbed.setFooter('Use the `welcome status` command to see the details of this feature');

					return this.sendSuccess(msg, welcomeEmbed);
				} catch (err) {
					return this.catchError(msg, { subCommand: 'enable' }, err);
				}
			}
		} else {
			return sendSimpleEmbeddedError(msg, 'Please set the channel for the welcome message before enabling the feature. See `help welcome` for info.', 3000);
		}
	}

	public async off(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const welcomeEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
				name: 'Server Welcome Message'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const welcomeEnabled = await msg.guild.settings.get('welcome.enabled');

		if (welcomeEnabled) {
			try {
				await msg.guild.settings.update('welcome.enabled', false, msg.guild);

				// Set up embed message
				welcomeEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Welcome messages set to: _Disabled_
				`);
				welcomeEmbed.setFooter('Use the `welcome status` command to see the details of this feature');

				return this.sendSuccess(msg, welcomeEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'disable' }, err);
			}
		} else {
			return sendSimpleEmbeddedMessage(msg, 'Welcome message already disabled!', 3000);
		}
	}

	/**
	 * Run the "welcome" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ subCommand: string, content: Channel | string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof WelcomeCommand
	 */
	public async status(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const welcomeEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
				name: 'Server Welcome Message'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();
		const welcomeChannel = await msg.guild.settings.get('welcome.channel');
		const welcomeMessage = await msg.guild.settings.get('welcome.message');
		const welcomeEnabled = await msg.guild.settings.get('welcome.enabled');

		// Set up embed message
		welcomeEmbed.setDescription(stripIndents`
			Welcome feature: ${welcomeEnabled ? '_Enabled_' : '_Disabled_'}
			Channel set to: <#${welcomeChannel}>
			Message set to:
			\`\`\`${welcomeMessage}\`\`\`
		`);
		// Send the success response
		return msg.sendEmbed(welcomeEmbed);
	}

	private catchError(msg: KlasaMessage, args: { subCommand: string, content?: Channel | string }, err: Error) {
		// Build warning message
		let welcomeWarn = stripIndents`
		Error occurred in \`welcome\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		**Input:** \`Welcome ${args.subCommand.toLowerCase()}\``;
		let welcomeUserWarn = '';

		switch (args.subCommand.toLowerCase()) {
			case 'on': {
				welcomeUserWarn = 'Enabling welcome feature failed!';
				break;
			}
			case 'off': {
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

		// Emit warn event for debugging
		msg.client.emit('warn', welcomeWarn);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, welcomeUserWarn);
	}

	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		modLogMessage(msg, embed);
		// Send the success response
		return msg.sendEmbed(embed);
	}
}