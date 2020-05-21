/**
 * Copyright (c) 2020 Spudnik Group
 */

import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Permissions } from 'discord.js';
import { stripIndents } from 'common-tags';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { getBytes } from '@lib/utils/util';

export default class CrateCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the install/publish size of a cargo crate.',
			requiredPermissions: Permissions.FLAGS.EMBED_LINKS,
			usage: '<name:string>'
		});
	}

	public async run(msg: KlasaMessage, [name]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		try {
			const { data } = await axios(`https://crates.io/api/v1/crates/${encodeURIComponent(name)}`);
			const { crate, versions: [latest] } = data;
			if (!crate) throw 'That crate doesn\'t exist.';

			const embed = baseEmbed(msg)
				.setThumbnail('https://doc.rust-lang.org/cargo/images/Cargo-Logo-Small.png')
				.setTitle(name)
				.setURL(`https://crates.io/crates/${name}`)
				.setDescription(stripIndents`
					${crate.description}
	
					${crate.documentation ? `[Documentation](${crate.documentation})` : ''} - ${crate.repository ? `[Repository](${crate.repository})` : ''}
				`)
				.addField('Total Downloads', crate.downloads.toLocaleString(), true)
				.addField('Latest Version', stripIndents`
					**Number:** ${latest.num}
					**Size:** ${getBytes(latest.crate_size)}
					**Downloads:** ${latest.downloads.toLocaleString()}
					**License:** ${latest.license}
				`, true);

			if (crate.categories.length) {
				embed.addField('Categories', crate.categories.join(', '), true);
			}
			if (crate.keywords.length) {
				embed.addField('Keywords', crate.keywords.join(', '), true);
			}

			return msg.sendEmbed(embed);
		} catch (err) {
			msg.client.emit('warn', `Error in command dev:crate: ${err}`);

			return msg.sendSimpleError('Could not fetch that crate, are you sure it exists?', 3000);
		}
	}

}
