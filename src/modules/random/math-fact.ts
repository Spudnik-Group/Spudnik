import chalk from 'chalk';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as request from 'request';
import { RequestResponse } from 'request';
import { sendSimpleEmbededError } from '../../lib/helpers';

export default class MathFactCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Gives a Random Math Fact.',
			group: 'random',
			guildOnly: true,
			memberName: 'math-fact',
			name: 'math-fact',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		request('http://numbersapi.com/random/math?json', (err: Error, res: RequestResponse, body: string) => {
			try {
				if (err) {
					throw err;
				}

				const data = JSON.parse(body);
				if (data && data.text) {
					return msg.embed(new MessageEmbed({
						color: 5592405,
						title: 'Math Fact',
						description: data.text,
					}));
				}
			} catch (err) {
				let msgTxt = 'command math-fact failed :disappointed_relieved:';
				//TODO: add debug logging: msgTxt += `\n${err.stack}`;
				console.log(chalk.red(err));
				return sendSimpleEmbededError(msg, msgTxt);
			}
		});
		return sendSimpleEmbededError(msg, 'Error getting fact. Try again?');
	}
}
