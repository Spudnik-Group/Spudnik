import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { startTyping, sendSimpleEmbeddedError, stopTyping } from '../../lib/helpers';
import { getEmbedColor } from '../../lib/custom-helpers';
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
	constructor(client: CommandoClient) {
		super(client, {
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
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof changelogCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
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
			const res: any[] = await axios.get('https://api.github.com/repos/Spudnik-Group/Spudnik/releases', {
				headers: {
					'Accept': 'application/vnd.github.v3+json',
					'User-Agent': 'Spudnik Bot'
				}
			});
			const changelog = res.slice(0, 3);
			changelog.forEach((release: any) => {
				stackEmbed.description += `

					- *${release.name}* -
					${release.body}
				`;
			});
			
			stopTyping(msg);
			
			return msg.embed(stackEmbed);
		} catch (err) {
			stopTyping(msg);
			msg.client.emit('warn', `Error in command dev:changelog: ${err}`);

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}
}
