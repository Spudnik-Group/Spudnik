import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { sendSimpleEmbeddedError, getEmbedColor } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * List warns for the guild.
 *
 * @export
 * @class ListWarnsCommand
 * @extends {Command}
 */
export default class ListWarnsCommand extends Command {
	/**
	 * Creates an instance of ListWarnsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ListWarnsCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: [
				'list-warn',
				'warn-list',
				'warns'
			],
			description: 'List warns for the guild.',
			name: 'list-warns'
		});
	}

	/**
	 * Run the "list-warns" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ member: GuildMember, reason: string }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof ListWarnsCommand
	 */
	public async run(msg: KlasaMessage): Promise<Message | Message[] | any> {
		const warnEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/warning-sign_26a0.png',
				name: 'Warnings List'
			},
			color: getEmbedColor(msg),
			description: ''
		});
		const guildWarnings = await msg.guild.settings.get('warnings');

		if (guildWarnings.length) {
			// Warnings present for current guild
			// Build embed
			guildWarnings.forEach(warning => {
				warnEmbed.description += stripIndents`

						<@${warning.id}> (${warning.id}) - ${warning.points} Points
					`;
			});
			warnEmbed.description += '\n\n';

			// Send the success response
			return msg.sendEmbed(warnEmbed);
		} else {
			// No warnings for current guild
			return sendSimpleEmbeddedError(msg, 'No warnings for current guild', 3000);
		}
	}
}
