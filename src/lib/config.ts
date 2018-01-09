import * as fs from 'fs';
import chalk from 'chalk';
import { Error } from 'mongoose';

export interface iConfig {
	debug: boolean;
	commandPrefix: string;
	elizaEnabled: boolean;
	pruneInterval: number;
	pruneMax: number;
	defaultEmbedColor: number;
}

class DefaultConfig implements iConfig {
	debug: false;
	commandPrefix: '!';
	elizaEnabled: false;
	pruneInterval: 10;
	pruneMax: 100;
	defaultEmbedColor: 5592405;
}

function config() {
	try {
		return JSON.parse(fs.readFileSync('../../config/config.json', 'utf8'));
	} catch (err) {
		// No config file, set up defaults
		const output: DefaultConfig = new DefaultConfig();
		try {
			if (fs.lstatSync('../config/config.json').isFile()) {
				console.log(chalk.yellow(`WARNING: config.json found but we couldn't read it!\n${err.stack}`));
			}
		} catch (err2) {
			console.log(chalk.red(err2));
			fs.writeFile('../config/config.json', JSON.stringify(output, null, 2), err3 => {
				if (err3) {
					throw new Error(err3.toString());
				}
			});
		}
		return output;
	}
}

module.exports = config();
