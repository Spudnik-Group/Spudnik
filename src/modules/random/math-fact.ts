import chalk from 'chalk';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as request from 'request';
import { RequestResponse } from 'request';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Post a random math fact.
 *
 * @export
 * @class MathFactCommand
 * @extends {Command}
 */
export default class MathFactCommand extends Command {
	/**
	 * Creates an instance of MathFactCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof MathFactCommand
	 */
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

	/**
	 * Run the "math-fact" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof MathFactCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		request('http://numbersapi.com/random/math?json', (err: Error, res: RequestResponse, body: string) => {
			try {
				if (err) {
					return sendSimpleEmbeddedError(msg, 'Error getting fact. Try again?');
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
				const msgTxt = 'command math-fact failed :disappointed_relieved:';
				//TODO: add debug logging: msgTxt += `\n${err.stack}`;
				console.log(chalk.red(err));
				return sendSimpleEmbeddedError(msg, msgTxt);
			}
		});
		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	}
}
