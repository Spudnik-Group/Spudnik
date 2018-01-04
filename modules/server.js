module.exports = Spudnik => {
	const servers = Spudnik.getJsonObject('/config/servers.json');
	return {
		commands: [
			'server'
		],
		server: {
			usage: `list|${servers.map(server => server.key).join('|')}`,
			process: (msg, suffix, isEdit, cb) => {
				if (suffix.toLowerCase() === 'list' || suffix.trim() === '') {
					cb({
						embed: {
							title: `${Spudnik.Config.serverName} Servers`,
							description: servers.map(server => server.key).sort().join('\n'),
							color: Spudnik.Config.defaultEmbedColor
						}
					}, msg);
				} else {
					const info = servers.filter(server => server.key === suffix.toLowerCase())[0];
					if (info) {
						cb({
							embed: {
								title: info.title,
								description: info.description,
								color: Spudnik.Config.defaultEmbedColor
							}
						}, msg);
					}
				}
			}
		}
	};
};
