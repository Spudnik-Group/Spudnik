import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, getEmbedColor, modLogMessage } from '../../lib/helpers';
import * as format from 'date-fns/format';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Enable or disable the adblock feature.
 *
 * @export
 * @class AdblockCommand
 * @extends {Command}
 */
export default class AdblockCommand extends Command {
	/**
	 * Creates an instance of AdblockCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof AdblockCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Enable or disable the adblock feature.',
			extendedHelp: stripIndents`
				syntax: \`!adblock <enable|disable>\`

				\`MANAGE_MESSAGES\` permission required.`,
			name: 'adblock',
			permissionLevel: 1,
			usage: '<on|off>',
			requiredPermissions: ['MANAGE_MESSAGES']
		});
	}

	public async off(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const adblockEnabled = await msg.guild.settings.get('adblockEnabled');
		const adblockEmbed: MessageEmbed = new MessageEmbed({
			author: {
				name: '🛑 Adblock'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();
		if (adblockEnabled) {
			try {
				await msg.guild.settings.update('adblockEnabled', false);
				// Set up embed message
				adblockEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Adblock _Disabled_
					`);

				return this.sendSuccess(msg, adblockEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'disable' }, err)
			}
		} else {
			return sendSimpleEmbeddedMessage(msg, 'Adblock feature already disabled!', 3000);
		}
	}
	/**
	 * Run the "adblock" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ subCommand: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof AdblockCommand
	 */
	public async on(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const adblockEnabled = await msg.guild.settings.get('adblockEnabled');
		const adblockEmbed: MessageEmbed = new MessageEmbed({
			author: {
				name: '🛑 Adblock'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();
		if (adblockEnabled) {
			return sendSimpleEmbeddedMessage(msg, 'Adblock feature already enabled!', 3000);
		} else {
			try {
				await msg.guild.settings.update('adblockEnabled', true);
				// Set up embed message
				adblockEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Adblock _Enabled_
					`);

				return this.sendSuccess(msg, adblockEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'enable' }, err)
			}
		}
	}

	private catchError(msg: KlasaMessage, args: { subCommand: string }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
			Error occurred in \`adblock\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`Adblock ${args.subCommand.toLowerCase()}\`
			**Error Message:** ${err}
		`);

		// Inform the user the command failed
		if (args.subCommand.toLowerCase() === 'enable') {
			return sendSimpleEmbeddedError(msg, 'Enabling adblock feature failed!');
		} else {
			return sendSimpleEmbeddedError(msg, 'Disabling adblock feature failed!');
		}
	}

	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		modLogMessage(msg, embed);
		// Send the success response
		return msg.sendEmbed(embed);
	}
}
