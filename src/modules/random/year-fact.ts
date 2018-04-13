import chalk from 'chalk';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as request from 'request';
import { RequestResponse } from 'request';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

export default class YearFactCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Gives a Random Year Fact.',
			group: 'random',
			guildOnly: true,
			memberName: 'year-fact',
			name: 'year-fact',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		request('http://numbersapi.com/random/year?json', (err: Error, res: RequestResponse, body: string) => {
			try {
				if (err) {
					return sendSimpleEmbeddedError(msg, 'Error getting fact. Try again?');
				}

				const data = JSON.parse(body);
				if (data && data.text) {
					return msg.embed(new MessageEmbed({
						color: 5592405,
						title: 'Year Fact',
						description: data.text,
					}));
				}
			} catch (err) {
				let msgTxt = 'command year-fact failed :disappointed_relieved:';
				//TODO: add debug logging: msgTxt += `\n${err.stack}`;
				console.log(chalk.red(err));
				return sendSimpleEmbeddedError(msg, msgTxt);
			}
		});
		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	}
}
