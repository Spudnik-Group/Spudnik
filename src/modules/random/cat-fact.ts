import chalk from 'chalk';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as request from 'request';
import { RequestResponse } from 'request';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Post a random cat fact.
 * 
 * @export
 * @class CatFactCommand
 * @extends {Command}
 */
export default class CatFactCommand extends Command {
	/**
	 * Creates an instance of CatFactCommand.
	 * 
	 * @param {CommandoClient} client 
	 * @memberof CatFactCommand
	 */
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

	/**
	 * Run the "cat-fact" command.
	 * 
	 * @param {CommandMessage} msg 
	 * @returns {(Promise<Message | Message[]>)} 
	 * @memberof CatFactCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		request('https://catfact.ninja/fact', (err: Error, res: RequestResponse, body: string) => {
			try {
				if (err) {
					return sendSimpleEmbeddedError(msg, 'Error getting fact. Try again?');
				}

				const data = JSON.parse(body);
				if (data && data.fact) {
					msg.embed(new MessageEmbed({
						color: 5592405,
						title: ':cat: Fact',
						description: data.fact,
					}));
				}
			} catch (err) {
				let msgTxt = 'command cat-fact failed :disappointed_relieved:';
				//TODO: add debug logging: msgTxt += `\n${err.stack}`;
				console.log(chalk.red(err));
				sendSimpleEmbeddedError(msg, msgTxt);
			}
		});
		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	}
}
