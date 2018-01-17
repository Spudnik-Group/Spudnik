import { Message, RichEmbed } from 'discord.js';
import { Spudnik } from '../spudnik';

module.exports = (Spudnik: Spudnik) => {
	return {
		commands: [
			'log',
			'reload',
			'servers',
			'uptime',
		],
		// tslint:disable:object-literal-sort-keys
		log: {
			usage: '<log message>',
			description: 'logs message to bot console',
			process: (msg: Message) => {
				console.log(msg.content);
			},
		},
		reload: {
			usage: '<command>',
			description: 'reloads all commands',
			process: (msg: Message, suffix: string) => {
				if (msg.member.hasPermission('ADMINISTRATOR')) {
					msg.channel.send(Spudnik.defaultEmbed('Reloading commands...')).then((response) => {
						Spudnik.setupCommands();
						if (response instanceof Message) {
							response.edit(Spudnik.defaultEmbed(`Reloaded ${Spudnik.commandCount()} Commands`));
						}
					});
				} else {
					return Spudnik.processMessage(Spudnik.defaultEmbed("You can't do that Dave..."), msg, false, false);
				}
			},
		},
		servers: {
			usage: '<command>',
			description: 'Returns a list of servers the bot is connected to',
			process: (msg: Message) => {
				msg.channel.send(new RichEmbed({
					color: Spudnik.Config.getDefaultEmbedColor(),
					title: Spudnik.Discord.user.username,
					description: `Currently on the following servers:\n\n${Spudnik.Discord.guilds.map((g) => `${g.name} - **${g.memberCount} Members**`).join('\n')}`,
				}));
			},
		},
		uptime: {
			usage: '<command>',
			description: 'returns the amount of time since the bot started',
			process: (msg: Message, suffix: string) => {
				return Spudnik.processMessage(Spudnik.defaultEmbed(`**Uptime**: ${Spudnik.getUptime()}`), msg, false, false);
			},
		},
	};
};
