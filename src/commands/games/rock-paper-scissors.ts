/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
const choices: string[] = ['rock', 'paper', 'scissors'];

/**
 * Starts a game of Rock Paper Scissors.
 *
 * @export
 * @class RockPaperScissorsCommand
 * @extends {Command}
 */
export default class RockPaperScissorsCommand extends Command {

	/**
	 * Creates an instance of RockPaperScissorsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof RockPaperScissorsCommand
	 */
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['rps'],
			description: 'Play Rock-Paper-Scissors.',
			extendedHelp: 'syntax: \`!rock-paper-scissors <choice>\`',
			name: 'rock-paper-scissors',
			usage: '<choice:string>'
		});
	}

	/**
	 * Run the "RockPaperScissors" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof RockPaperScissorsCommand
	 */
	public async run(msg: KlasaMessage, [choice]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const response = choices[Math.floor(Math.random() * choices.length)];

		if (choice.toLowerCase() === 'rock') {
			if (response === 'rock') return msg.sendMessage('Rock! Aw... A tie...', { reply: msg.author });
			if (response === 'paper') return msg.sendMessage('Paper! Yes! I win!', { reply: msg.author });
			if (response === 'scissors') return msg.sendMessage('Scissors! Aw... I lose...', { reply: msg.author });
		}

		if (choice.toLowerCase() === 'paper') {
			if (response === 'rock') return msg.sendMessage('Rock! Aw... I lose...', { reply: msg.author });
			if (response === 'paper') return msg.sendMessage('Paper! Aw... A tie...', { reply: msg.author });
			if (response === 'scissors') return msg.sendMessage('Scissors! Yes! I win!', { reply: msg.author });
		}

		if (choice.toLowerCase() === 'scissors') {
			if (response === 'rock') return msg.sendMessage('Rock! Yes! I win!', { reply: msg.author });
			if (response === 'paper') return msg.sendMessage('Paper! Aw... I lose...', { reply: msg.author });
			if (response === 'scissors') return msg.sendMessage('Scissors! Aw... A tie...', { reply: msg.author });
		}

		return msg.sendMessage('I win by default, you little cheater.', { reply: msg.author });
	}

}
