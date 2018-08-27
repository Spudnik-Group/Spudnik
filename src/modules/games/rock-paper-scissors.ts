import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
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
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['rps'],
			args: [
				{
					key: 'choice',
					parse: (choice: string) => choice.toLowerCase(),
					prompt: 'Rock, Paper, or Scissors?',
					type: 'string'
				}
			],
			description: 'Play Rock-Paper-Scissors.',
			group: 'games',
			memberName: 'rock-paper-scissors',
			name: 'rock-paper-scissors'
		});

	}

	/**
	 * Run the "RockPaperScissors" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof RockPaperScissorsCommand
	 */
	public async run(msg: CommandMessage, args: { choice: string }): Promise<Message | Message[]> {
		const response = choices[Math.floor(Math.random() * choices.length)];
		if (args.choice === 'rock') {
			if (response === 'rock') { return msg.reply('Rock! Aw... A tie...'); }
			if (response === 'paper') { return msg.reply('Paper! Yes! I win!'); }
			if (response === 'scissors') { return msg.reply('Scissors! Aw... I lose...'); }
		}
		if (args.choice === 'paper') {
			if (response === 'rock') { return msg.reply('Rock! Aw... I lose...'); }
			if (response === 'paper') { return msg.reply('Paper! Aw... A tie...'); }
			if (response === 'scissors') { return msg.reply('Scissors! Yes! I win!'); }
		}
		if (args.choice === 'scissors') {
			if (response === 'rock') { return msg.reply('Rock! Yes! I win!'); }
			if (response === 'paper') { return msg.reply('Paper! Aw... I lose...'); }
			if (response === 'scissors') { return msg.reply('Scissors! Aw... A tie...'); }
		}
		return msg.reply('I win by default, you little cheater.');
	}
}
