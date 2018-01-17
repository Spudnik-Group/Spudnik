import chalk from 'chalk';

import { Spudnik } from '../../spudnik';

module.exports = (Spudnik: Spudnik) => {
	Spudnik.Discord.on('disconnected', () => {
		console.log(chalk.red('Disconnected from Discord!'));
	});
};
