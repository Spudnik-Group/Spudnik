import chalk from 'chalk';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as request from 'request';
import { RequestResponse } from 'request';
import { sendSimpleEmbededError } from '../../lib/helpers';

export default class CatFactCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Gives a Random Cat Fact.',
			group: 'random',
			guildOnly: true,
			memberName: 'cat-fact',
			name: 'cat-fact',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		request('https://catfact.ninja/fact', (err: Error, res: RequestResponse, body: string) => {
			try {
				if (err) {
					throw err;
				}

				const data = JSON.parse(body);
				if (data && data.fact) {
					msg.embed(new MessageEmbed({
						color: 5592405,
						title: 'Cat Fact',
						description: data.fact,
					}));
				}
			} catch (err) {
				let msgTxt = 'command cat-fact failed :disappointed_relieved:';
				//TODO: add debug logging: msgTxt += `\n${err.stack}`;
				console.log(chalk.red(err));
				sendSimpleEmbededError(msg, msgTxt);
			}
		});
		return sendSimpleEmbededError(msg, 'Error getting fact. Try again?');
	}
}
