import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { list } from '../../lib/helpers';
//tslint:disable-next-line
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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['typing-game'],
			args: [
				{
					key: 'difficulty',
					oneOf: difficulties,
					parse: (difficulty: string) => difficulty.toLowerCase(),
					prompt: `What should the difficulty of the game be? Either ${list(difficulties, 'or')}.`,
					type: 'string'
				}
			],
			description: 'See how fast you can type a sentence in a given time limit.',
			details: stripIndents`
				syntax: \`!typing-test <difficulty\`
				**Difficulties**: ${difficulties.join(', ')}
			`,
			examples: ['!typing-test easy', '!typing-test hard'],
			group: 'game',
			guildOnly: true,
			memberName: 'typing-test',
			name: 'typing-test'
		});

	}

	/**
	 * Run the "TypingTest" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof TypingTestCommand
	 */
	public async run(msg: KlasaMessage, args: { difficulty: string }): Promise<KlasaMessage | KlasaMessage[]> {
		const sentence = sentences[Math.floor(Math.random() * sentences.length)];
		const time = times[args.difficulty];
		await msg.reply(stripIndents`
			**You have ${time / 1000} seconds to type this sentence.**
			${sentence}
		`);
		const now = Date.now();
		const msgs: any = await msg.channel.awaitMessages((res: any) => res.author.id === msg.author.id, {
			max: 1,
			time: time
		});
		if (!msgs.size || msgs.first().content !== sentence) { return msg.reply('Sorry! You lose!'); }
		
		return msg.reply(`Nice job! 10/10! You deserve some cake! (Took ${(Date.now() - now) / 1000} seconds)`);
	}
}
