import chalk from 'chalk';
import Rollbar = require('rollbar');

export function handleDisconnected(err: Error, rollbar: Rollbar) {
	if (process.env.NODE_ENV !== 'development') rollbar.critical(`Disconnected from Discord!\nError: ${err}`);
	console.log(chalk.red('Disconnected from Discord!'));
	process.exit();
}
