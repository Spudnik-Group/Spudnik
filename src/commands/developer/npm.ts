/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import axios from 'axios';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { baseEmbed } from '@lib/helpers/embed-helpers';

/**
 * Returns details for an NPM package.
 *
 * @export
 * @class NPMCommand
 * @extends {Command}
 */
export default class NPMCommand extends Command {

	/**
	 * Creates an instance of NPMCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof NPMCommand
	 */
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['npmpackage', 'npmpkg', 'nodepackagemanager'],
			description: 'Returns details for an NPM package.',
			extendedHelp: stripIndents`
				syntax: \`!npm <package-name>\`
			`,
			name: 'npm',
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<query:...string>'
		});
	}

	/**
	 * Run the "npm" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof NPMCommand
	 */
	public async run(msg: KlasaMessage, [query]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const npmEmbed: MessageEmbed = baseEmbed(msg)
			.setAuthor(
				'NPM',
				'https://authy.com/wp-content/uploads/npm-logo.png',
				'https://npmjs.com'
			);

		try {
			const { data: res } = await axios.get(`https://registry.npmjs.com/${query}`);
			const version = res.versions[res['dist-tags'].latest];
			let deps = version.dependencies ? Object.keys(version.dependencies) : null;
			let maintainers = res.maintainers.map((user: any) => user.name);

			if (maintainers.length > 10) {
				const len = maintainers.length - 10;
				maintainers = maintainers.slice(0, 10);
				maintainers.push(`...${len} more.`);
			}

			if (deps && deps.length > 10) {
				const len = deps.length - 10;
				deps = deps.slice(0, 10);
				deps.push(`...${len} more.`);
			}

			npmEmbed
				.setTitle(`NPM - ${query}`)
				.setURL(`https://npmjs.com/package/${query}`)
				.setDescription(`
					${res.description || 'No Description.'}
	
					❯ **Version:** ${res['dist-tags'].latest}
					❯ **License:** ${res.license}
					❯ **Author:** ${res.author ? res.author.name : 'Unknown'}
					❯ **Modified:** ${new Timestamp('MM/DD/YYYY h:mm A').display(res.time.modified)}
					❯ **Dependencies:** ${deps && deps.length ? deps.join(', ') : 'None'}
				`);

			return msg.sendEmbed(npmEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command dev:npm: ${err}`);

			return msg.sendSimpleError('Could not fetch that package, are you sure it exists?', 3000);
		}
	}

}
