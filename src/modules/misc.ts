import { Message } from 'discord.js';
import { Spudnik } from '../spudnik';

//tslint:disable-next-line
const unshort = require('unshort');

module.exports = (Spudnik: Spudnik) => {
	return {
		commands: [
			'help',
			'lmgtfy',
			'unshorten',
			'ping',
			'say',
		],
		// tslint:disable:object-literal-sort-keys
		help: {
			usage: '<command> OR by itself, it lists all commands',
			description: 'Gives help on commands',
			process: (msg: Message, suffix: string) => {
				const commands = Spudnik.Commands;
				const cmdTxt = msg.content.split(' ')[0].substring(Spudnik.Config.getCommandPrefix().length).toLowerCase();
				const cmd = commands[cmdTxt];
				// Help is special since it iterates over the other commands
				if (suffix) {
					const cmds = suffix.split(' ').filter((cmd: string) => {
						return commands[cmd];
					});

					let info = '';
					if (cmds.length > 0) {
						cmds.forEach((cmd) => {
							info += `**${Spudnik.Config.getCommandPrefix() + cmd}**`;
							const usage = commands[cmd].usage;
							if (usage) {
								info += ` ${usage}`;
							}

							let description = commands[cmd].description;

							if (description instanceof Function) {
								description = description();
							}

							if (description) {
								info += `\n\t${description}`;
							}
							info += '\n';
						});

						msg.channel.send(info);
						return;
					}
					msg.channel.send("I can't describe a command that doesn't exist");
				} else {
					msg.author.send('**Available Commands:**').then(() => {
						let batch = '';
						const sortedCommands = Object.keys(commands).sort();
						for (const i in sortedCommands) {
							const cmd = sortedCommands[i];
							let info = `**${Spudnik.Config.getCommandPrefix() + cmd}**`;
							const usage = commands[cmd].usage;

							if (usage) {
								info += ` ${usage}`;
							}

							let description = commands[cmd].description;

							if (description instanceof Function) {
								description = description();
							}

							if (description) {
								info += `\n\t${description}`;
							}

							const newBatch = `${batch}\n${info}`;

							if (newBatch.length > (1024 - 8)) { // Limit message length
								msg.author.send(batch);
								batch = info;
							} else {
								batch = newBatch;
							}
						}

						if (batch.length > 0) {
							msg.author.send(batch);
						}
					});
				}
			},
		},
		lmgtfy: {
			usage: '<Let Me Google that for You>',
			description: 'Plebs, plz.',
			process: (msg: Message, suffix: string) => {
				if (suffix) {
					Spudnik.processMessage(`<http://lmgtfy.com/?q=${encodeURI(require('remove-markdown')(suffix))}>`, msg, false, true);
				}
			},
		},
		unshorten: {
			usage: '<link to shorten>',
			description: 'Unshorten a link.',
			process: (msg: Message, suffix: string) => {
				if (suffix) {
					unshort(suffix, (err: Error, url: string) => {
						if (url) {
							Spudnik.processMessage(`Original url is: ${url}`, msg, false, false);
						} else {
							Spudnik.processMessage('This url can\'t be expanded', msg, false, false);
							if (Spudnik.Config.getDebug()) {
								console.log(err);
							}
						}
					});
				}
			},
		},
		ping: {
			description: 'responds pong, useful for checking if bot is alive',
			process: (msg: Message, suffix: string) => {
				Spudnik.processMessage(`${msg.author} pong!`, msg, false, false);
			},
		},
		say: {
			usage: '<message>',
			description: 'bot says message',
			process: (msg: Message, suffix: string) => {
				Spudnik.processMessage(suffix, msg, false, false);
			},
		},
	};
};
