import { Spudnik } from '../spudnik';

import * as path from 'path';
import chalk from 'chalk';

module.exports = (Spudnik: Spudnik) => {
	let commandFiles: string[];
	let commandDirectory: string;
	try {
		commandDirectory = 'modules';
		commandFiles = Spudnik.getFileArray(commandDirectory);
	} catch (err) {
		console.log(chalk.red(err));
	}

	// Helpers
	Spudnik.setupcommands();

	console.log(`Loaded ${Spudnik.commandCount()} commands`);
};
