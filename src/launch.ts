import chalk from 'chalk';
import * as Discord from 'discord.js';
import { Spudnik } from './lib/spudnik';
const Config = {
	'botListUpdateInterval': +process.env.spud_botlist_update_interval || 1800000,
	'dblApiKey': process.env.spud_dblapi || '',
	'debug': !!process.env.spud_debug || false,
	'mongoDB': process.env.spud_mongo,
	'owner': process.env.spud_owner.split(','),
	'rollbarApiKey': process.env.spud_rollbarapi || '',
	'statusUpdateInterval': +process.env.spud_status_update_interval || 30000,
	'token': process.env.spud_token
}

console.log(chalk.blue('3...\n2...\n1...\nLAUNCH'));
console.log(chalk.blue('---Spudnik Stage 1 Engaged.---'));
console.log(chalk.green(`LD - Node version: ${process.version}`));
console.log(chalk.green(`LDA - Discord.js version: ${Discord.version}`));

process.chdir(__dirname);
const bot: Spudnik = new Spudnik(Config);
