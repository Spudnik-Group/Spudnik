/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { words } from '../../extras/hangman';

/**
 * Starts a game of Hangman.
 *
 * @export
 * @class HangmanCommand
 * @extends {Command}
 */
export default class HangmanCommand extends Command {

	private playing: Set<string> = new Set();

	/**
	 * Creates an instance of HangmanCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof HangmanCommand
	 */
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Prevent a man from being hanged by guessing a word as fast as you can.',
			name: 'hangman'
		});
	}

	/**
	 * Run the "Hangman" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof HangmanCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		if (this.playing.has(msg.channel.id)) {
			return msg.sendMessage('Only one game may be occurring per channel.', { reply: msg.author });
		}

		this.playing.add(msg.channel.id);

		try {
			const word = words[Math.floor(Math.random() * words.length)].toLowerCase();
			let points = 0;
			let displayText = null;
			let guessed = false;
			const confirmation: string[] = [];
			const incorrect: string[] = [];
			const display = new Array(word.length).fill('_');

			while (word.length !== confirmation.length && points < 6) {
				await msg.sendMessage(stripIndents`
					${displayText === null ? 'Here we go!' : displayText ? 'Good job!' : 'Nope!'}
					\`${display.join(' ')}\`. Which letter do you choose?
					Incorrect Tries: ${incorrect.join(', ') || 'None'}
					\`\`\`
					___________
					|     |
					|     ${points > 0 ? 'O' : ''}
					|    ${points > 2 ? '—' : ' '}${points > 1 ? '|' : ''}${points > 3 ? '—' : ''}
					|    ${points > 4 ? '/' : ''} ${points > 5 ? '\\' : ''}
					===========
					\`\`\`
				`);
				const filter = (res: any): boolean => {
					const choice = res.content.toLowerCase();

					return res.author.id === msg.author.id && !confirmation.includes(choice) && !incorrect.includes(choice);
				};

				const guess: any = await msg.channel.awaitMessages(filter, {
					max: 1,
					time: 30000
				});

				if (!guess.size) {
					await msg.sendMessage('Sorry, time is up!');

					break;
				}

				const choice = guess.first().content.toLowerCase();

				if (choice === 'end') break;

				if (choice.length > 1 && choice === word) {
					guessed = true;

					break;
				} else if (word.includes(choice)) {
					displayText = true;
					for (let i = 0; i < word.length; i++) {
						if (word.charAt(i) !== choice) continue;
						confirmation.push(word.charAt(i));
						display[i] = word.charAt(i);
					}
				} else {
					displayText = false;
					if (choice.length === 1) incorrect.push(choice);
					points++;
				}
			}
			this.playing.delete(msg.channel.id);
			if (word.length === confirmation.length || guessed) return msg.sendMessage(`You won, it was ${word}!`);

			return msg.sendMessage(`Too bad... It was ${word}...`);
		} catch (err) {
			this.playing.delete(msg.channel.id);

			return msg.sendMessage(`Oh no, an error occurred: \`${err.message}\`. Try again later!`, { reply: msg.author });
		}
	}

}
