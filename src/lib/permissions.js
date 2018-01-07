const chalk = require('chalk');

function permissions() {
	let permissions = {};

	try {
		permissions = require('../config/permissions');
	} catch (err) {
		console.log(chalk.red(err));
		permissions.commands = {};
	}

	permissions.checkPermission = function (guildId, command) {
		try {
			let allowed = true;
			try {
				if (permissions.commands && permissions.commands.hasOwnProperty(command)) {
					allowed = false;
					if (permissions.commands[command].includes(guildId)) {
						allowed = true;
					}
				}
			} catch (err) {
				console.log(err);
			}
			return allowed;
		} catch (err) {
			console.log(err);
		}
		return false;
	};

	return permissions;
}

module.exports = permissions();
