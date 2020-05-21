/**
 * Copyright (c) 2020 Spudnik Group
 */

import 'module-alias/register';
import * as chalk from 'chalk';
import { version } from 'discord.js';
import Spudnik from '@lib/spudnik';

console.log(chalk.blue('3...\n2...\n1...\nLAUNCH'));
console.log(chalk.blue('---Spudnik Stage 1 Engaged.---'));
console.log(chalk.green(`LD - Node version: ${process.version}`));
console.log(chalk.green(`LDA - Discord.js version: ${version}`));

process.chdir(__dirname);

new Spudnik();
