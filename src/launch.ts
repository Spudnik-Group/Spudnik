import chalk from 'chalk';
import * as fs from 'fs';
import { JsonConvert } from 'json2typescript';
import { Spudnik } from './spudnik';
import { iAuth } from './lib/auth';
import { iConfig } from './lib/config';

console.log(chalk.blue(`3...\n2...\n1...\nLAUNCH`));
console.log(chalk.blue(`---Spudnik Stage 1 Engaged.---`));
console.log(chalk.green(`Node version: ${process.version}`));
const authObj: object = JSON.parse(fs.readFileSync('../config/auth.json', 'utf8'));
const jsonConvert: JsonConvert = new JsonConvert();
const Auth: iAuth = jsonConvert.deserializeObject(authObj, iAuth);
console.dir(Auth);
/*const Config: iConfig = require('./lib/config');
const bot: Spudnik = new Spudnik();
bot.launch(Auth, Config);

console.log(chalk.blue(`---SPUDNIK LAUNCH SUCCESS...---`));*/