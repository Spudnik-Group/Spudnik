/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { list } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';

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
 * Starts a game of Math Quiz.
 *
 * @export
 * @class MathQuizCommand
 * @extends {Command}
 */
export default class MathQuizCommand extends Command {

	/**
	 * Creates an instance of MathQuizCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof MathQuizCommand
	 */
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['math-game'],
			description: 'See how fast you can answer a math problem in a given time limit.',
			extendedHelp: stripIndents`
				syntax: \`!math- quiz <difficulty>\`
				**Difficulties**: ${difficulties.join(', ')}
			`,
			name: 'math-quiz',
			usage: '[difficulty:string]'
		});

		this.createCustomResolver('difficulty', (arg: string) => {
			if (difficulties.includes(arg.toLowerCase())) return arg;
			throw new Error(`Please provide a valid difficulty level. Options are: ${list(difficulties, 'or')}.`);
		});
	}

	/**
	 * Run the "MathQuiz" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof MathQuizCommand
	 */
	public async run(msg: KlasaMessage, [difficulty]): Promise<KlasaMessage | KlasaMessage[]> {
		const value1 = Math.floor(Math.random() * maxValues[difficulty]) + 1;
		const value2 = Math.floor(Math.random() * maxValues[difficulty]) + 1;
		const operation = operations[Math.floor(Math.random() * operations.length)];
		let answer: any;

		switch (operation) {
			case '+':
				answer = value1 + value2;
				break;
			case '-':
				answer = value1 - value2;
				break;
			case '*':
				answer = value1 * value2;
				break;
		}

		await msg.reply(stripIndents`
			**You have 10 seconds to answer this question.**
			${value1} ${operation} ${value2}
		`);

		const msgs: any = await msg.channel.awaitMessages(res => res.author.id === msg.author.id, {
			max: 1,
			time: 10000
		});

		if (!msgs.size) return msg.sendMessage(`Sorry, time is up! It was ${answer}.`, { reply: msg.author });
		if (msgs.first().content !== answer.toString()) return msg.sendMessage(`Nope, sorry, it's ${answer}.`, { reply: msg.author });

		return msg.sendMessage('Nice job! 10/10! You deserve some cake!', { reply: msg.author });
	}

}
