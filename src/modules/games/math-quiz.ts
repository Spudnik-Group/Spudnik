import { stripIndents } from 'common-tags';
import { Collection, Message, MessageEmbed, User } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { awaitPlayers, delay, randomRange, sendSimpleEmbeddedError, verify, list } from '../../lib/helpers';
const difficulties: string[] = ['easy', 'medium', 'hard', 'extreme', 'impossible'];
const operations = ['+', '-', '*'];
const maxValues: any = {
	easy: 10,
	extreme: 1000,
	hard: 500,
	impossible: 1000000,
	medium: 100
};

/**
 * Starts a game of Balloon Pop.
 *
 * @export
 * @class BalloonPopCommand
 * @extends {Command}
 */
export default class BalloonPopCommand extends Command {
	private playing = new Set();

	/**
	 * Creates an instance of BalloonPopCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof BalloonPopCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['math-game'],
			args: [
				{
					key: 'difficulty',
					oneOf: difficulties,
					parse: (difficulty: any) => difficulty.toLowerCase(),
					prompt: `What should the difficulty of the game be? Either ${list(difficulties, 'or')}.`,
					type: 'string'
				}
			],
			description: 'See how fast you can answer a math problem in a given time limit.',
			details: `**Difficulties**: ${difficulties.join(', ')}`,
			group: 'games',
			memberName: 'math-quiz',
			name: 'math-quiz'
		});

	}

	/**
	 * Run the "BalloonPop" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof BalloonPopCommand
	 */
	public async run(msg: CommandMessage, args: { difficulty: string }): Promise<Message | Message[]> {
		const value1 = Math.floor(Math.random() * maxValues[args.difficulty]) + 1;
		const value2 = Math.floor(Math.random() * maxValues[args.difficulty]) + 1;
		const operation = operations[Math.floor(Math.random() * operations.length)];
		let answer: any;
		switch (operation) {
			case '+': answer = value1 + value2; break;
			case '-': answer = value1 - value2; break;
			case '*': answer = value1 * value2; break;
		}
		await msg.reply(stripIndents`
			**You have 10 seconds to answer this question.**
			${value1} ${operation} ${value2}
		`);
		const msgs: any = await msg.channel.awaitMessages((res) => res.author.id === msg.author.id, {
			max: 1,
			time: 10000
		});
		if (!msgs.size) { return msg.reply(`Sorry, time is up! It was ${answer}.`); }
		if (msgs.first().content !== answer.toString()) { return msg.reply(`Nope, sorry, it's ${answer}.`); }
		return msg.reply('Nice job! 10/10! You deserve some cake!');
	}
}
