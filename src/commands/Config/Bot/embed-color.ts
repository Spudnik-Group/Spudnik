import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { sendSimpleEmbeddedError } from '../../../lib/helpers';
import * as format from 'date-fns/format';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Change the default embed color for the server.
 *
 * @export
 * @class EmbedColorCommand
 * @extends {Command}
 */
export default class EmbedColorCommand extends Command {
	/**
	 * Creates an instance of EmbedColorCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof EmbedColorCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Used to change the default embed color the bot uses for responses, or reset it.',
			extendedHelp: stripIndents`
				syntax: \`!embedcolor (hex color)\`

				Supplying no hex color resets the embed color to default.

				\`MANAGE_GUILD\` permission required.
			`,
			name: 'embedcolor',
			usage: '[color:regex/^ *[a-f0-9]{6} *$/i]'
		});
	}

	/**
	 * Run the "embedColor" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ color: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof EmbedColorCommand
	 */
	public async run(msg: KlasaMessage, [color]): Promise<KlasaMessage | KlasaMessage[]> {
		const embedColorEmbed: MessageEmbed = new MessageEmbed({
			author: {
				iconURL: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/artist-palette_1f3a8.png',
				name: 'Embed Color'
			},
			description: ''
		}).setTimestamp();

		if (color) {
			try {
				await msg.guild.settings.update('embedColor', color);
				// Set up embed message
				embedColorEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Embed Color set to ${color}
				`);

				return this.sendSuccess(msg, embedColorEmbed);
			} catch (err) {
				return this.catchError(msg, { color }, err)
			}
		} else {
			try {
				await msg.guild.settings.update('embedColor', '55555');
				// Set up embed message
				embedColorEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Embed Color Reset
				`);

				return this.sendSuccess(msg, embedColorEmbed);
			} catch (err) {
				return this.catchError(msg, { color: null }, err)
			}
		}
	}

	private catchError(msg: KlasaMessage, args: { color: string }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
			Error occurred in \`embedcolor\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`${args.color}\`
			**Error Message:** ${err}
		`);

		// Inform the user the command failed
		if (args.color) {
			return sendSimpleEmbeddedError(msg, `There was an error setting the embed color to ${args.color}`)
		} else {
			return sendSimpleEmbeddedError(msg, 'There was an error resetting the embed color.');
		}
	}

	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendEmbed(embed);
	}
}
