const fs = require('fs');
const chalk = require('chalk');

function config() {
	let config = {};

	try {
		config = require('../config/config');
	} catch (err) {
		// No config file, set up defaults
		config.debug = false;
		config.commandPrefix = '!';
		config.elizaEnabled = false;
		config.externalModules = [];

		config.serverName = 'insert your server name';
		config.welcomeChannel = 'insert channel id of channel where you want welcome to be';
		config.pruneInterval = 10;
		config.pruneMax = 100;
		config.defaultEmbedColor = 5592405;

		try {
			if (fs.lstatSync('../config/config.json').isFile()) {
				console.log(chalk.yellow(`WARNING: config.json found but we couldn't read it!\n${err.stack}`));
			}
		} catch (err2) {
			console.log(chalk.red(err2));
			fs.writeFile('../config/config.json', JSON.stringify(config, null, 2), err3 => {
				if (err3) {
					throw new Error(err3);
				}
			});
		}
	}

	if (!Object.keys(config).includes('commandPrefix')) {
		config.commandPrefix = '!';
	}

	return config;
}

module.exports = config();
