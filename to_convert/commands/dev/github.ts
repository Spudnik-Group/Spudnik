import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { startTyping, sendSimpleEmbeddedError, stopTyping } from '../../lib/helpers';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import axios from 'axios';

/**
 * Returns details for a GitHub repository.
 *
 * @export
 * @class GithubCommand
 * @extends {Command}
 */
export default class GithubCommand extends Command {
	/**
	 * Creates an instance of GithubCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof GithubCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['gh'],
			args: [
				{
					key: 'query',
					prompt: 'What repository would you like details for?',
					type: 'string',
					validate: (query: string) => {
						const [name, repo] = query.split('/');
						if(name && repo) {
							return true;
						}

						return 'Invalid repository, it must be in format `username/repository`';
					}
				}
			],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Returns details for a GitHub repository.',
			details: stripIndents`
				syntax: \`!github <repo-name>\`
			`,
			examples: [
				'!github Spudnik-Group/Spudnik'
			],
			group: 'dev',
			guildOnly: true,
			memberName: 'github',
			name: 'github',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "github" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GithubCommand
	 */
	public async run(msg: KlasaMessage, args: { query: string }): Promise<KlasaMessage | KlasaMessage[]> {
		const githubEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
				name: 'GitHub',
				url: 'https://github.com'
			},
			color: getEmbedColor(msg),
			description: ''
		});

		startTyping(msg);

		try {
			const { data: res } = await axios.get(`https://api.github.com/repos/${args.query}`, {
				headers: {
					'Accept': 'application/vnd.github.v3+json',
					'User-Agent': 'Spudnik Bot'
				}
			});
			const size = res.size <= 1024 ? `${res.size} KB` : Math.floor(res.size / 1024) > 1024 ? `${(res.size / 1024 / 1024).toFixed(2)} GB` : `${(res.size / 1024).toFixed(2)} MB`;
			const license = res.license && res.license.name && res.license.url ? `[${res.license.name}](${res.license.url})` : res.license && res.license.name || 'None';
			const footer = [];
			if(res.fork) footer.push(`❯ **Forked** from [${res.parent.full_name}](${res.parent.html_url})`);
			if(res.archived) footer.push('❯ This repository is **Archived**');
			githubEmbed
				.setTitle(res.full_name)
				.setURL(res.html_url)
				.setThumbnail(res.owner.avatar_url)
				.setDescription(`
					${res.description || 'No Description.'}
					
					❯ **Language:** ${res.language}
					❯ **Forks:** ${res.forks_count.toLocaleString()}
					❯ **License:** ${license}
					❯ **Open Issues/PRs:** ${res.open_issues.toLocaleString()}
					❯ **Watchers:** ${res.subscribers_count.toLocaleString()}
					❯ **Stars:** ${res.stargazers_count.toLocaleString()}
					❯ **Clone Size:** ${size}${footer.length ? `${footer.join('\n')}` : ''}
				`);
			deleteCommandMessages(msg);
			stopTyping(msg);
			
			return msg.embed(githubEmbed)
		} catch(err) {
			msg.client.emit('warn', `Error in command dev:github: ${err}`);
			
			deleteCommandMessages(msg);
			stopTyping(msg);

			return sendSimpleEmbeddedError(msg, 'Could not fetch that repo, are you sure it exists?', 3000);
		}
	}
}
