import { Message, MessageEmbed } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { startTyping, sendSimpleEmbeddedError, stopTyping } from '../../lib/helpers';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import axios from 'axios';

/**
 * Returns GitHub release notes for the 3 most recent releases.
 *
 * @export
 * @class changelogCommand
 * @extends {Command}
 */
export default class changelogCommand extends Command {
	/**
	 * Creates an instance of changelogCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof changelogCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			clientPermissions: ['EMBED_LINKS'],
			description: 'Returns GitHub release notes for the 3 most recent releases.',
			examples: [
				'!changelog'
			],
			group: 'default',
			guildOnly: true,
			memberName: 'changelog',
			name: 'changelog',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "changelog" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof changelogCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const stackEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/scroll_1f4dc.png',
				name: 'Change Log',
				url: 'https://github.com/Spudnik-Group/Spudnik'
			},
			color: getEmbedColor(msg),
			description: ''
		});

		startTyping(msg);

		try {
			const res: any = await axios.get('https://api.github.com/repos/Spudnik-Group/Spudnik/releases', {
				headers: {
					'Accept': 'application/vnd.github.v3+json',
					'User-Agent': 'Spudnik Bot'
				}
			});

			const changelog = res.data.slice(0, 3);

			changelog.forEach((release: any) => {
				stackEmbed.description += `

					- *${release.name}* -
					${release.body}`;
			});

			stackEmbed.description += `

				Check out the full changelog [here](https://github.com/Spudnik-Group/Spudnik/releases)
			`;
			
			deleteCommandMessages(msg);
			stopTyping(msg);
			
			return msg.embed(stackEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command dev:changelog: ${err}`);

			deleteCommandMessages(msg);
			stopTyping(msg);

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}
}
