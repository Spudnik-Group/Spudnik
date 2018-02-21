import chalk from 'chalk';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { RequestResponse } from 'request';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

export default class DateFactCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Gives a Random Date Fact.',
			group: 'random',
			guildOnly: true,
			memberName: 'date-fact',
			name: 'date-fact',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		require('request')('http://numbersapi.com/random/date?json', (err: Error, res: RequestResponse, body: string) => {
			try {
				if (err) {
					return sendSimpleEmbeddedError(msg, 'Error getting fact. Try again?');
				}

				const data = JSON.parse(body);
				if (data && data.text) {
					return msg.embed(new MessageEmbed({
						color: 5592405,
						title: 'Date Fact',
						description: data.text,
					}));
				}
			} catch (err) {
				let msgTxt = 'command date-fact failed :disappointed_relieved:';
				//TODO: add debug logging: msgTxt += `\n${err.stack}`;
				console.log(chalk.red(err));
				return sendSimpleEmbeddedError(msg, msgTxt);
			}
		});
		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	}
}
