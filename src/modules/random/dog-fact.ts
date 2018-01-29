import chalk from 'chalk';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as request from 'request';
import { RequestResponse } from 'request';
import { sendSimpleEmbededError } from '../../lib/helpers';

export default class DogFactCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Gives a Random Dog Fact.',
			group: 'random',
			guildOnly: true,
			memberName: 'dog-fact',
			name: 'dog-fact',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		request('https://dog-api.kinduff.com/api/facts', (err: Error, res: RequestResponse, body: string) => {
			try {
				if (err) {
					throw err;
				}

				const data = JSON.parse(body);
				if (data && data.facts && data.facts[0]) {
					return msg.embed(new MessageEmbed({
						color: 5592405,
						title: 'Dog Fact',
						description: data.facts[0],
					}));
				}
			} catch (err) {
				let msgTxt = 'command dog-fact failed :disappointed_relieved:';
				//TODO: add debug logging: msgTxt += `\n${err.stack}`;
				console.log(chalk.red(err));
				return sendSimpleEmbededError(msg, msgTxt);
			}
		});
		return sendSimpleEmbededError(msg, 'Error getting fact. Try again?');
	}
}
