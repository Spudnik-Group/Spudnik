import chalk from 'chalk';
import * as fs from 'fs';
import { JsonConvert } from 'json2typescript';
import { Spudnik } from './spudnik';
import { Auth } from './lib/auth';
import { Config } from './lib/config';

console.log(chalk.blue(`3...\n2...\n1...\nLAUNCH`));
console.log(chalk.blue(`---Spudnik Stage 1 Engaged.---`));
console.log(chalk.green(`Node version: ${process.version}`));
const bot: Spudnik = new Spudnik();

bot.launch(Auth, Config);

console.log(chalk.blue(`---SPUDNIK LAUNCH SUCCESS...---`));