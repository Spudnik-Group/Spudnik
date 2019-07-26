import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { startTyping, sendSimpleEmbeddedError, stopTyping } from '../../lib/helpers';
import { getEmbedColor } from '../../lib/custom-helpers';
import axios from 'axios';
import * as format from 'date-fns/format';

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
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['npmpackage', 'npmpkg', 'nodepackagemanager'],
			args: [
				{
					key: 'query',
					prompt: 'What package would you like details for?',
					type: 'string'
				}
			],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Returns details for an NPM package.',
			details: stripIndents`
				syntax: \`!npm <package-name>\`
			`,
			examples: [
				'!npm date-fns'
			],
			group: 'dev',
			guildOnly: true,
			memberName: 'npm',
			name: 'npm',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "npm" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof NPMCommand
	 */
	public async run(msg: CommandoMessage, args: { query: string }): Promise<Message | Message[]> {
		const npmEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://authy.com/wp-content/uploads/npm-logo.png',
				name: 'NPM',
				url: 'https://npmjs.com'
			},
			color: getEmbedColor(msg),
			description: ''
		});

		startTyping(msg);

		try {
			const { data: res } = await axios.get(`https://registry.npmjs.com/${args.query}`);
			const version = res.versions[res['dist-tags'].latest];
			let deps = version.dependencies ? Object.keys(version.dependencies) : null;
			let maintainers = res.maintainers.map((user: any) => user.name);
	
			if(maintainers.length > 10) {
				const len = maintainers.length - 10;
				maintainers = maintainers.slice(0, 10);
				maintainers.push(`...${len} more.`);
			}
	
			if(deps && deps.length > 10) {
				const len = deps.length - 10;
				deps = deps.slice(0, 10);
				deps.push(`...${len} more.`);
			}
	
			npmEmbed
				.setTitle(`NPM - ${args.query}`)
				.setURL(`https://npmjs.com/package/${args.query}`)
				.setDescription(`
					${res.description || 'No Description.'}
	
					❯ **Version:** ${res['dist-tags'].latest}
					❯ **License:** ${res.license}
					❯ **Author:** ${res.author ? res.author.name : 'Unknown'}
					❯ **Modified:** ${format(res.time.modified, 'MM/DD/YYYY h:mm A')}
					❯ **Dependencies:** ${deps && deps.length ? deps.join(', ') : 'None'}
				`);
			stopTyping(msg);
			
			return msg.embed(npmEmbed)
		} catch (err) {
			stopTyping(msg);
			msg.client.emit('warn', `Error in command dev:npm: ${err}`);

			return sendSimpleEmbeddedError(msg, 'Could not fetch that package, are you sure it exists?', 3000);
		}
	}
}
