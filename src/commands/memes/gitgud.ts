import { stripIndents } from 'common-tags';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { sendSimpleEmbeddedImage } from '../../lib/helpers';
import { MessageEmbed } from 'discord.js';

/**
 * Post the "gitgud" image at someone.
 *
 * @export
 * @class GitGudCommand
 * @extends {Command}
 */
export default class GitGudCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Informs someone that they should "git gud".',
			name: 'gitgud',
			usage: '[mention:member]'
		});
	}

	/**
	 * Run the "gitgud" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ mention: GuildMember }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GitGudCommand
	 */
	public async run(msg: KlasaMessage, [mention]): Promise<KlasaMessage | KlasaMessage[]> {
		const gitgudImageURL = 'http://i.imgur.com/NqpPXHu.jpg';

		if (mention && mention !== null) {
			return msg.sendEmbed(new MessageEmbed({ image: { url: gitgudImageURL } }), '', {
				reply: mention
			});
		} else {
			return sendSimpleEmbeddedImage(msg, gitgudImageURL);
		}
	}
}
