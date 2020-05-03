/**
 * Copyright (c) 2020 Spudnik Group
 */

import { CommandStore, KlasaMessage, Command } from 'klasa';
import { Permissions } from 'discord.js';
import axios, { AxiosResponse } from 'axios';

/**
 * Returns GitHub release notes for the 3 most recent releases.
 *
 * @export
 * @class changelogCommand
 * @extends {Command}
 */
export default class ChangelogCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns GitHub release notes for the 3 most recent releases.',
			name: 'changelog',
			requiredPermissions: Permissions.FLAGS.EMBED_LINKS
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
		try {
			let output: string = '';
			const res: AxiosResponse<any> = await axios.get('https://api.github.com/repos/Spudnik-Group/Spudnik/releases', {
				headers: {
					'Accept': 'application/vnd.github.v3+json',
					'User-Agent': 'Spudnik Bot'
				}
			});

			const changelog: Array<any> = res.data.slice(0, 3);

			changelog.forEach((release: any) => {
				output += `

					- *${release.name}* -
					${release.body}`;
			});

			output += `

				Check out the full changelog [here](https://github.com/Spudnik-Group/Spudnik/releases)
			`;

			return msg.sendSimpleEmbedWithAuthor(output, {
				name: 'Change Log',
				iconURL: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/scroll_1f4dc.png',
				url: 'https://github.com/Spudnik-Group/Spudnik'
			});
		} catch (err) {
			msg.client.emit('warn', `Error in command dev:changelog: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

}
