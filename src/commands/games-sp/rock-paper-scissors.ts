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
			aliases: ['rps', 'rock-paper-scissors'],
			description: 'Play Rock-Paper-Scissors.',
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
			if (response === 'rock') return msg.sendSimpleEmbedReply('Rock! Aw... A tie...');
			if (response === 'paper') return msg.sendSimpleEmbedReply('Paper! Yes! I win!');
			if (response === 'scissors') return msg.sendSimpleEmbedReply('Scissors! Aw... I lose...');
		}

		if (choice.toLowerCase() === 'paper') {
			if (response === 'rock') return msg.sendSimpleEmbedReply('Rock! Aw... I lose...');
			if (response === 'paper') return msg.sendSimpleEmbedReply('Paper! Aw... A tie...');
			if (response === 'scissors') return msg.sendSimpleEmbedReply('Scissors! Yes! I win!');
		}

		if (choice.toLowerCase() === 'scissors') {
			if (response === 'rock') return msg.sendSimpleEmbedReply('Rock! Yes! I win!');
			if (response === 'paper') return msg.sendSimpleEmbedReply('Paper! Aw... I lose...');
			if (response === 'scissors') return msg.sendSimpleEmbedReply('Scissors! Aw... A tie...');
		}

		return msg.sendSimpleEmbedReply('I win by default, you little cheater.');
	}

}
