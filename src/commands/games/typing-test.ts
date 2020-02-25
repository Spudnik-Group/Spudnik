/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { list } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';

const sentences = require('../../extras/typing-test');
const difficulties = ['easy', 'medium', 'hard', 'extreme', 'impossible'];
const times: any = {
	easy: 25000,
	extreme: 10000,
	hard: 15000,
	impossible: 5000,
	medium: 20000
}

/**
 * Starts a game of Typing Test.
 *
 * @export
 * @class TypingTestCommand
 * @extends {Command}
 */
export default class TypingTestCommand extends Command {
	/**
	 * Creates an instance of TypingTestCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof TypingTestCommand
	 */
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['typing-game'],
			description: 'See how fast you can type a sentence in a given time limit.',
			extendedHelp: stripIndents`
				syntax: \`!typing-test <difficulty\`
				**Difficulties**: ${difficulties.join(', ')}
			`,
			name: 'typing-test',
			usage: '<difficulty:string>'
		});

		this.createCustomResolver('difficulty', (arg: string) => {
			if (difficulties.includes(arg.toLowerCase())) return arg;
			throw `Please provide a valid difficulty level. Options are: ${list(difficulties, 'or')}.`;
		})
	}

	/**
	 * Run the "TypingTest" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof TypingTestCommand
	 */
	public async run(msg: KlasaMessage, [difficulty]): Promise<KlasaMessage | KlasaMessage[]> {
		const sentence = sentences[Math.floor(Math.random() * sentences.length)];
		const time = times[difficulty];
		await msg.reply(stripIndents`
			**You have ${time / 1000} seconds to type this sentence.**
			${sentence}
		`);
		const now = Date.now();
		const msgs: any = await msg.channel.awaitMessages((res: any) => res.author.id === msg.author.id, {
			max: 1,
			time: time
		});
		if (!msgs.size || msgs.first().content !== sentence) { return msg.sendMessage('Sorry! You lose!', { reply: msg.author }); }

		return msg.sendMessage(`Nice job! 10/10! You deserve some cake! (Took ${(Date.now() - now) / 1000} seconds)`, { reply: msg.author });
	}
}
