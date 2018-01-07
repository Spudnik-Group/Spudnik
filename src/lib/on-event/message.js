module.exports = Spudnik => {
	function messageCallback(output, msg, expires, delCalling) {
		if (expires) {
			return msg.channel.send(output).then(message => message.delete(5000));
		}
		if (delCalling) {
			return msg.channel.send(output).then(() => msg.delete());
		}
		msg.channel.send(output);
	}

	function checkMessageForCommand(msg, isEdit) {
		// Drop our own messages to prevent feedback loops
		if (msg.author === Spudnik.Discord.user) {
			return;
		}
		if (msg.channel.type === 'dm') {
			msg.channel.send(`I don't respond to direct messages. Besides this response, of course.`);
			return;
		}
		if (msg.isMentioned(Spudnik.Discord.user)) {
			if (Spudnik.Config.elizaEnabled) {
				// If Eliza AI is enabled, respond to @mention
				const message = msg.content.replace(`${Spudnik.Discord.user} `, '');
				msg.channel.send(Spudnik.Eliza.transform(message));
				return;
			}

			msg.channel.send('Yes?');
			return;
		}

		// Check if message is a command
		if (msg.content.startsWith(Spudnik.Config.commandPrefix)) {
			const commands = Spudnik.commands;
			const cmdTxt = msg.content.split(' ')[0].substring(Spudnik.Config.commandPrefix.length).toLowerCase();
			const suffix = msg.content.substring(cmdTxt.length + Spudnik.Config.commandPrefix.length + 1); // Add one for the ! and one for the space
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
							if (Spudnik.Permissions.checkPermission(msg.guild.id, cmd)) {
								info += `**${Spudnik.Config.commandPrefix + cmd}**`;
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
							}
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
							let info = `**${Spudnik.Config.commandPrefix + cmd}**`;
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
							color: Spudnik.Config.defaultEmbedColor,
							description: 'Reloading commands...'
						}
					}).then(response => {
						Spudnik.setupCommands();
						Spudnik.setupDiscordCommands();
						response.delete();
						msg.channel.send({
							embed: {
								color: Spudnik.Config.defaultEmbedColor,
								description: `Reloaded:\n* ${Spudnik.commandCount()} Base Commands\n* ${Object.keys(Spudnik.DiscordCommands).length} Discord Commands`
							}
						});
					});
				} else {
					msg.channel.send({
						embed: {
							color: Spudnik.Config.defaultEmbedColor,
							description: `You can't do that Dave...`
						}
					});
				}
			} else if (cmd) {
				try {
					if (Spudnik.Permissions.checkPermission(msg.guild.id, cmdTxt)) {
						console.log(`Treating ${msg.content} from ${msg.guild.id}:${msg.author} as command`);
						cmd.process(msg, suffix, isEdit, messageCallback);
					} else {
						console.log(msg.guild.id, cmdTxt, `failed`);
					}
				} catch (err) {
					let msgTxt = `Command ${cmdTxt} failed :disappointed_relieved:`;
					if (Spudnik.Config.debug) {
						msgTxt += `\n${err.stack}`;
					}
					msg.channel.send(msgTxt);
				}
			} else {
				msg.channel.send(`${cmdTxt} not recognized as a command!`).then((message => message.delete(5000)));
			}
		}
	}

	Spudnik.Discord.on('message', msg => checkMessageForCommand(msg, false));
	Spudnik.Discord.on('messageUpdate', (oldMessage, newMessage) => {
		checkMessageForCommand(newMessage, true);
	});
};
