import chalk from 'chalk';
import * as Discord from 'discord.js';
import * as fs from 'fs';
import { Config } from './lib/config';
import { Spudnik } from './spudnik';

console.log(chalk.blue('3...\n2...\n1...\nLAUNCH'));
console.log(chalk.blue('---Spudnik Stage 1 Engaged.---'));
console.log(chalk.green(`LD - Node version: ${process.version}`));
console.log(chalk.green(`LDA - Discord.js version: ${Discord.version}`));
console.log(chalk.blue('---Spudnik Stage 2 Engaged.---'));

process.chdir(__dirname);
const bot: Spudnik = new Spudnik(Config);
