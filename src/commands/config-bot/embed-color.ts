/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { hexColor } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

/**
 * Change the default embed color for the server.
 *
 * @export
 * @class EmbedColorCommand
 * @extends {Command}
 */
export default class EmbedColorCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['embedcolor'],
			description: 'Used to change the default embed color the bot uses for responses, or reset it.',
			extendedHelp: stripIndents`
				Supplying no hex color resets the embed color to default.
			`,
			name: 'embed-color',
			permissionLevel: 6, // MANAGE_GUILD
			usage: '[color:string]'
		});

		this.createCustomResolver('color', hexColor);
	}

	/**
	 * Run the "embedColor" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {string} color
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof EmbedColorCommand
	 */
	public async run(msg: KlasaMessage, [color]: string[]): Promise<KlasaMessage | KlasaMessage[]> {
		const embedColorEmbed: MessageEmbed = new MessageEmbed({
			author: {
				iconURL: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/artist-palette_1f3a8.png',
				name: 'Embed Color'
			},
			description: ''
		}).setTimestamp();

		if (color) {
			color = color.toUpperCase();
			if (!(/^[0-9A-F]{3}([0-9A-F]{3})?$/i.test(color))) {
				return msg.sendSimpleEmbed(`${color} is not a valid hex code.`, 3000);
			}
			
			if (color.length === 3) {
				color = color.split('').map(l => l.concat(l)).join('');
			}
			
			try {
				await msg.guild.settings.update(GuildSettings.EmbedColor, color);

				// Set up embed message
				embedColorEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Embed Color set to ${color}
				`);

				return this.sendSuccess(msg, embedColorEmbed);
			} catch (err) {
				return this.catchError(msg, { color }, err);
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
				return this.catchError(msg, { color: null }, err);
			}
		}
	}

	private catchError(msg: KlasaMessage, args: { color: string }, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
			Error occurred in \`embedcolor\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
			**Input:** \`${args.color}\`
			**Error Message:** ${err}
		`);

		// Inform the user the command failed
		if (args.color) {
			return msg.sendSimpleError(`There was an error setting the embed color to ${args.color}`);
		}
		return msg.sendSimpleError('There was an error resetting the embed color.');

	}

	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendEmbed(embed);
	}

}
