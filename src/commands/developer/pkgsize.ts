/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import axios from 'axios';
import { stripIndents } from 'common-tags';
import { Permissions } from 'discord.js';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { getBytes } from '@lib/utils/util';

export default class PackagesizeCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the install/publish size of a npm package.',
			requiredPermissions: Permissions.FLAGS.EMBED_LINKS,
			usage: '<name:string>'
		});
	}

	public async run(msg: KlasaMessage, [name]: [string]): Promise<KlasaMessage|KlasaMessage[]> {
		try {
			const { data } = await axios(`https://packagephobia.now.sh/api.json?p=${encodeURIComponent(name)}`);
			const { publishSize, installSize } = data;
			if (!publishSize && !installSize) throw new Error("That package doesn't exist.");

			return msg.sendEmbed(baseEmbed(msg)
				.setDescription(stripIndents`
					<https://www.npmjs.com/package/${name}>
	
					**Publish Size:** ${getBytes(publishSize)}
					**Install Size:** ${getBytes(installSize)}
				`));
		} catch (err) {
			msg.client.emit('warn', `Error in command dev:pkgsize: ${err}`);

			return msg.sendSimpleError('Could not fetch that repo, are you sure it exists?', 3000);
		}
	}

}
