import { Message, RichEmbed } from 'discord.js';
import { Spudnik } from '../spudnik';

module.exports = (Spudnik: Spudnik) => {
	const servers = Spudnik.getJsonObject('/config/servers.json');
	return {
		commands: [
			'server',
		],
		// tslint:disable:object-literal-sort-keys
		server: {
			usage: `list|${servers.map((server: any) => server.key).join('|')}`,
			process: (msg: Message, suffix: string) => {
				if (suffix.toLowerCase() === 'list' || suffix.trim() === '') {
					Spudnik.processMessage(new RichEmbed({
						title: `${msg.guild.name} Servers`,
						description: servers.map((server: any) => server.key).sort().join('\n'),
						color: Spudnik.Config.getDefaultEmbedColor(),
					}), msg, false, false);
				} else {
					const info = servers.filter((server: any) => server.key === suffix.toLowerCase())[0];
					if (info) {
						Spudnik.processMessage(new RichEmbed({
							title: info.title,
							description: info.description,
							color: Spudnik.Config.getDefaultEmbedColor(),
						}), msg, false, false);
					}
				}
			},
		},
	};
};
