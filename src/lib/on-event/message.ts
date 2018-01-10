import { Spudnik } from "../../spudnik";
import { Message } from "discord.js";

module.exports = (Spudnik: Spudnik) => {
	function messageCallback(output: any, msg: Message, expires: boolean, delCalling: boolean) {
		if (expires) {
			return msg.channel.send(output).then(message => message.delete(5000)); // TODO: fix
		}
		if (delCalling) {
			return msg.channel.send(output).then(() => msg.delete());
		}
		msg.channel.send(output);
	}

	function checkMessageForCommand(msg: Message, isEdit: boolean) {
		// Drop our own messages to prevent feedback loops
		if (msg.author === Spudnik.Discord.user) {
			return;
		}
		if (msg.channel.type === 'dm') {
			msg.channel.send(`I don't respond to direct messages. Besides this response, of course.`);
			return;
		}
		if (msg.isMentioned(Spudnik.Discord.user)) {
			/*
			if (Spudnik.Config.getElizaEnabled()) {
				// If Eliza AI is enabled, respond to @mention
				const message = msg.content.replace(`${Spudnik.Discord.user} `, '');
				msg.channel.send(Spudnik.Eliza.transform(message));
				return;
			}
			*/

			msg.channel.send('Yes?');
			return;
		}

		// Check if message is a command
		if (msg.content.startsWith(Spudnik.Config.getCommandPrefix())) {
			const commands = Spudnik.Commands;
			const cmdTxt = msg.content.split(' ')[0].substring(Spudnik.Config.getCommandPrefix().length).toLowerCase();
			const suffix = msg.content.substring(cmdTxt.length + Spudnik.Config.getCommandPrefix().length + 1); // Add one for the ! and one for the space
			const cmd = commands[cmdTxt];

			if (cmdTxt === 'help') {
				// Help is special since it iterates over the other commands
				if (suffix) {
					const cmds = suffix.split(' ').filter(cmd => {
						return commands[cmd];
					});

					let info = '';
					if (cmds.length > 0) {
						cmds.forEach(cmd => {
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
					msg.channel.send(`I can't describe a command that doesn't exist`);
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
			} else if (cmdTxt === 'reload') {
				if (msg.member.hasPermission('ADMINISTRATOR')) {
					msg.channel.send({
						embed: {
							color: Spudnik.Config.getDefaultEmbedColor(),
							description: 'Reloading commands...'
						}
					}).then(response => {
						Spudnik.setupCommands();
						response.delete(); // TODO: fix
						msg.channel.send({
							embed: {
								color: Spudnik.Config.getDefaultEmbedColor(),
								description: `Reloaded:\n* ${Spudnik.commandCount()} Base Commands\n* ${Object.keys(Spudnik.Commands).length} Discord Commands`
							}
						});
					});
				} else {
					msg.channel.send({
						embed: {
							color: Spudnik.Config.getDefaultEmbedColor(),
							description: `You can't do that Dave...`
						}
					});
				}
			} else if (cmd) {
				try {
					console.log(`Treating ${msg.content} from ${msg.guild.id}:${msg.author} as command`);
					cmd.process(msg, suffix, isEdit, messageCallback);
				} catch (err) {
					let msgTxt = `Command ${cmdTxt} failed :disappointed_relieved:`;
					if (Spudnik.Config.getDebug()) {
						msgTxt += `\n${err.stack}`;
					}
					msg.channel.send(msgTxt);
				}
			} else {
				msg.channel.send(`${cmdTxt} not recognized as a command!`).then((message => message.delete(5000))); // TODO: fix
			}
		}
	}

	Spudnik.Discord.on('message', msg => checkMessageForCommand(msg, false));
};
