/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { list } from '@lib/utils/util';

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
			aliases: ['math-game', 'math-quiz'],
			description: 'See how fast you can answer a math problem in a given time limit.',
			extendedHelp: stripIndents`
				**Difficulties**: ${difficulties.join(', ')}
			`,
			usage: '[difficulty:string]'
		});

		this.createCustomResolver('difficulty', (arg: string) => {
			if (difficulties.includes(arg.toLowerCase())) return arg;
			throw `Please provide a valid difficulty level. Options are: ${list(difficulties, 'or')}.`;
		});
	}

	/**
	 * Run the "MathQuiz" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof MathQuizCommand
	 */
	public async run(msg: KlasaMessage, [difficulty]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
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

		const msgs: any = await msg.channel.awaitMessages((res: any) => res.author.id === msg.author.id, {
			max: 1,
			time: 10000
		});

		if (!msgs.size) return msg.sendSimpleEmbedReply(`Sorry, time is up! It was ${answer}.`);
		if (msgs.first().content !== answer.toString()) return msg.sendSimpleEmbedReply(`Nope, sorry, it's ${answer}.`);

		return msg.sendSimpleEmbedReply('Nice job! 10/10! You deserve some cake!');
	}

}
