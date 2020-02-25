/**
 * Copyright (c) 2020 Spudnik Group
 */

import { CommandStore, KlasaMessage, Command } from 'klasa';
import { getEmbedColor, sendSimpleEmbeddedError } from '@lib/helpers';
import { MessageEmbed, Permissions } from 'discord.js';
import axios, { AxiosResponse } from 'axios';

/**
 * Returns GitHub release notes for the 3 most recent releases.
 *
 * @export
 * @class changelogCommand
 * @extends {Command}
 */
export default class changelogCommand extends Command {
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns GitHub release notes for the 3 most recent releases.',
			name: 'changelog',
			requiredPermissions: Permissions.FLAGS['EMBED_LINKS']
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

		try {
			const res: AxiosResponse<any> = await axios.get('https://api.github.com/repos/Spudnik-Group/Spudnik/releases', {
				headers: {
					'Accept': 'application/vnd.github.v3+json',
					'User-Agent': 'Spudnik Bot'
				}
			});

			const changelog: Array<any> = res.data.slice(0, 3);

			changelog.forEach((release: any) => {
				stackEmbed.description += `

					- *${release.name}* -
					${release.body}`;
			});

			stackEmbed.description += `

				Check out the full changelog [here](https://github.com/Spudnik-Group/Spudnik/releases)
			`;

			return msg.sendEmbed(stackEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command dev:changelog: ${err}`);

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}
}
