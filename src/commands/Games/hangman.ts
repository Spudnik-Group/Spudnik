import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
//tslint:disable-next-line
const words = require('../../extras/hangman');

/**
 * Starts a game of Hangman.
 *
 * @export
 * @class HangmanCommand
 * @extends {Command}
 */
export default class HangmanCommand extends Command {
	private playing = new Set();

	/**
	 * Creates an instance of HangmanCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof HangmanCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Prevent a man from being hanged by guessing a word as fast as you can.',
			examples: ['!hangman'],
			group: 'game',
			guildOnly: true,
			memberName: 'hangman',
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
	public async run(msg: KlasaMessage, args: { space: string }): Promise<KlasaMessage | KlasaMessage[]> {
		if (this.playing.has(msg.channel.id)) {
			return msg.reply('Only one game may be occurring per channel.');
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
				await msg.say(stripIndents`
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
				const filter = (res: any) => {
					const choice = res.content.toLowerCase();
					
					return res.author.id === msg.author.id && !confirmation.includes(choice) && !incorrect.includes(choice);
				}

				const guess: any = await msg.channel.awaitMessages(filter, {
					max: 1,
					time: 30000
				});

				if (!guess.size) {
					await msg.say('Sorry, time is up!');
					
					break;
				}

				const choice = guess.first().content.toLowerCase();

				if (choice === 'end') { break; }

				if (choice.length > 1 && choice === word) {
					guessed = true;
					
					break;
				} else if (word.includes(choice)) {
					displayText = true;
					for (let i = 0; i < word.length; i++) {
						if (word.charAt(i) !== choice) { continue; }
						confirmation.push(word.charAt(i));
						display[i] = word.charAt(i);
					}
				} else {
					displayText = false;
					if (choice.length === 1) { incorrect.push(choice); }
					points++;
				}
			}
			this.playing.delete(msg.channel.id);
			if (word.length === confirmation.length || guessed) { return msg.say(`You won, it was ${word}!`); }

			return msg.say(`Too bad... It was ${word}...`);
		} catch (err) {
			this.playing.delete(msg.channel.id);
			
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
}
