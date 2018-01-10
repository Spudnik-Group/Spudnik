import chalk from 'chalk';
import * as fs from 'fs';
import * as Discord from 'discord.js'
import { Spudnik } from './spudnik';
import { Auth } from './lib/auth';
import { Config } from './lib/config';

console.log(chalk.blue(`3...\n2...\n1...\nLAUNCH`));
console.log(chalk.blue(`---Spudnik Stage 1 Engaged.---`));
console.log(chalk.green(`LD - Node version: ${process.version}`));
console.log(chalk.green(`LDA - Discord.js version: ${Discord.version}`));
console.log(chalk.blue(`---Spudnik Stage 2 Engaged.---`));

const bot: Spudnik = new Spudnik(Auth, Config);