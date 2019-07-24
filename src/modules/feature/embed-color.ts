import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, startTyping, stopTyping } from '../../lib/helpers';
import { modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import * as format from 'date-fns/format';

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
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					default: '',
					key: 'color',
					prompt: 'What color would you like embeds to be?\n',
					type: 'string',
					validate: (color: string) => {
						if (!isNaN(color.match(/^ *[a-f0-9]{6} *$/i) ? parseInt(color, 16) : NaN)) {
							return true;
						} else if (color === '') {
							return true;
						}
						
						return 'You provided an invalid color hex number. Please try again.';
					}
				}
			],
			description: 'Used to change the default embed color the bot uses for responses, or reset it.',
			details: stripIndents`
				syntax: \`!embedcolor (hex color)\`

				Supplying no hex color resets the embed color to default.

				MANAGE_GUILD permission required.
			`,
			examples: [
				'!embedcolor',
				'!embedcolor 555555'
			],
			group: 'feature',
			guildOnly: true,
			memberName: 'embedcolor',
			name: 'embedcolor',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['MANAGE_GUILD']
		});
	}

	/**
	 * Run the "embedColor" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ color: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof EmbedColorCommand
	 */
	public async run(msg: CommandoMessage, args: { color: string }): Promise<Message | Message[]> {
		const embedColorEmbed: MessageEmbed = new MessageEmbed({
			author: {
				iconURL: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/artist-palette_1f3a8.png',
				name: 'Embed Color'
			},
			description: ''
		}).setTimestamp();

		startTyping(msg);

		if (args.color) {
			try {
				await msg.guild.settings.set('embedColor', args.color);
				// Set up embed message
				embedColorEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Embed Color set to ${args.color}
				`);

				return this.sendSuccess(msg, embedColorEmbed);
			} catch (err) {
				return this.catchError(msg, args, err)
			}
		} else {
			try {
				await msg.guild.settings.remove('embedColor');
				// Set up embed message
				embedColorEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Embed Color Reset
				`);

				return this.sendSuccess(msg, embedColorEmbed);
			} catch (err) {
				return this.catchError(msg, args, err)
			}
		}
	}

	private catchError(msg: CommandoMessage, args: { color: string }, err: Error) {
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
		stopTyping(msg);

		if (args.color) {
			return sendSimpleEmbeddedError(msg, `There was an error setting the embed color to ${args.color}`)
		} else {
			return sendSimpleEmbeddedError(msg, 'There was an error resetting the embed color.');
		}
	}

	private sendSuccess(msg: CommandoMessage, embed: MessageEmbed): Promise<Message | Message[]> {
		modLogMessage(msg, embed);
		deleteCommandMessages(msg);
		stopTyping(msg);

		// Send the success response
		return msg.embed(embed);
	}
}
