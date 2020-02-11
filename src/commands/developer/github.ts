import { stripIndents } from 'common-tags';
import { MessageEmbed, Permissions } from 'discord.js';
import { sendSimpleEmbeddedError, getEmbedColor } from '../../lib/helpers';
import axios from 'axios';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Returns details for a GitHub repository.
 *
 * @export
 * @class GithubCommand
 * @extends {Command}
 */
export default class GithubCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['gh'],
			description: 'Returns details for a GitHub repository.',
			extendedHelp: stripIndents`
				syntax: \`!github <repo-name>\`
			`,
			name: 'github',
			requiredPermissions: Permissions.FLAGS.EMBED_LINKS,
			usage: '<query:string>'
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
	public async run(msg: KlasaMessage, [query]): Promise<KlasaMessage | KlasaMessage[]> {
		if (query.indexOf('/') === -1) return sendSimpleEmbeddedError(msg, 'Invalid repository, it must be in the format: `username/repositoryname`');

		const githubEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
				name: 'GitHub',
				url: 'https://github.com'
			},
			color: getEmbedColor(msg),
			description: ''
		});

		try {
			const { data: res } = await axios.get(`https://api.github.com/repos/${query}`, {
				headers: {
					'Accept': 'application/vnd.github.v3+json',
					'User-Agent': 'Spudnik Bot'
				}
			});
			const size = res.size <= 1024 ? `${res.size} KB` : Math.floor(res.size / 1024) > 1024 ? `${(res.size / 1024 / 1024).toFixed(2)} GB` : `${(res.size / 1024).toFixed(2)} MB`;
			const license = res.license && res.license.name && res.license.url ? `[${res.license.name}](${res.license.url})` : res.license && res.license.name || 'None';
			const footer = [];
			if (res.fork) footer.push(`❯ **Forked** from [${res.parent.full_name}](${res.parent.html_url})`);
			if (res.archived) footer.push('❯ This repository is **Archived**');
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

			return msg.sendEmbed(githubEmbed)
		} catch (err) {
			msg.client.emit('warn', `Error in command dev:github: ${err}`);

			return sendSimpleEmbeddedError(msg, 'Could not fetch that repo, are you sure it exists?', 3000);
		}
	}
}
