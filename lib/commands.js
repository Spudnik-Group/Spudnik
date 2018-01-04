const path = require('path');
const chalk = require('chalk');

module.exports = Spudnik => {
	let commandFiles;
	let commandDirectory;
	try {
		commandDirectory = 'modules';
		commandFiles = Spudnik.getFileArray(commandDirectory);
	} catch (err) {
		console.log(chalk.red(err));
	}

	// Helpers
	Spudnik.addCommand = (commandName, commandObject) => {
		try {
			Spudnik.commands[commandName] = commandObject;
		} catch (err) {
			console.log(err);
		}
	};

	Spudnik.commandCount = () => {
		return Object.keys(Spudnik.commands).length;
	};

	Spudnik.setupcommands = () => {
		Spudnik.commands = {};

		// Load more complex response commands from markdown files
		let markdownCommands = [];
		try {
			markdownCommands = Spudnik.getJsonObject('/config/markdown-commands.json');
		} catch (err) {
			console.log(chalk.red(err));
		}
		markdownCommands.forEach(markdownCommand => {
			const command = markdownCommand.command;
			const description = markdownCommand.description;
			const deleteRequest = markdownCommand.deleteRequest;
			const channelRestriction = markdownCommand.channelRestriction;
			const file = markdownCommand.file;
			const messagesToSend = Spudnik.getFileContents(file);
			if (messagesToSend) {
				Spudnik.addCommand(command, {
					description,
					process: (msg, suffix, isEdit, cb) => {
						if (channelRestriction === undefined || (channelRestriction && msg.channel.id === channelRestriction)) {
							if (deleteRequest) {
								msg.delete();
							}

							const messages = messagesToSend.split('=====');
							messages.forEach(message => {
								message = message.split('-----');
								cb({
									embed: {
										color: Spudnik.Config.defaultEmbedColor,
										title: message[0].trim(),
										description: message[1].trim()
									}
								}, msg);
							});
						}
					}
				});
			}
		});

		// Load command files
		commandFiles.forEach(commandFile => {
			try {
				commandFile = Spudnik.require(`${path.join(commandDirectory, commandFile)}`);
			} catch (err) {
				console.log(chalk.red(`Improper setup of the '${commandFile}' command file. : ${err}`));
			}

			if (commandFile) {
				if (commandFile.commands) {
					commandFile.commands.forEach(command => {
						if (command in commandFile) {
							Spudnik.addCommand(command, commandFile[command]);
						}
					});
				}
			}
		});

		// Load simple commands from json file
		let jsonCommands = [];
		try {
			jsonCommands = Spudnik.getJsonObject('/config/commands.json');
		} catch (err) {
			console.log(chalk.red(err));
		}
		jsonCommands.forEach(jsonCommand => {
			const command = jsonCommand.command;
			const description = jsonCommand.description;
			const response = jsonCommand.response;

			Spudnik.addCommand(command, {
				description,
				process: (msg, suffix, isEdit, cb) => {
					cb({
						embed: {
							color: Spudnik.Config.defaultEmbedColor,
							description: response
						}
					}, msg);
				}
			});
		});
	};
	Spudnik.setupcommands();

	console.log(`Loaded ${Spudnik.commandCount()} commands`);
};
