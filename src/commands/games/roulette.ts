/**
 * Copyright (c) 2020 Spudnik Group
 */

import { oneLine } from 'common-tags';
import { Command, CommandStore, KlasaMessage } from 'klasa';

const red = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const black = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
const numbers = [0].concat(red, black);
const dozens = ['1-12', '13-24', '25-36'];
const halves = ['1-18', '19-36'];
const columns = ['1st', '2nd', '3rd'];
const parity = ['even', 'odd'];
const colors = ['red', 'black'];

/**
 * Starts a game of Roulette.
 *
 * @export
 * @class RouletteCommand
 * @extends {Command}
 */
export default class RouletteCommand extends Command {

	/**
	 * Creates an instance of RouletteCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof RouletteCommand
	 */
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Play a game of roulette.',
			extendedHelp: 'syntax: \`!roulette <space choice>\`',
			name: 'roulette',
			usage: '<space:string>'
		});

		this.createCustomResolver('space', (arg, possible, msg, [action]) => {
			if (numbers.includes(Number.parseInt(arg, 10))) { return arg; }
			if (dozens.includes(arg)) { return arg; }
			if (halves.includes(arg)) { return arg; }
			if (columns.includes(arg.toLowerCase())) { return arg; }
			if (parity.includes(arg.toLowerCase())) { return arg; }
			if (colors.includes(arg.toLowerCase())) { return arg; }

			throw oneLine`
				Invalid space, please enter either a specific number from 0-36, a range of dozens (e.g. 1-12), a range of
				halves (e.g. 1-18), a column (e.g. 1st), a color (e.g. black), or a parity (e.g. even).
			`;
		});
	}

	/**
	 * Run the "Roulette" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof RouletteCommand
	 */
	public async run(msg: KlasaMessage, [space]): Promise<KlasaMessage | KlasaMessage[]> {
		const num: number = Math.floor(Math.random() * 37);
		const color = num ? red.includes(num) ? 'RED' : 'BLACK' : null;
		const win = this.verifyWin(space, num);

		return msg.sendMessage(`The result is **${num}${color ? ` ${color}` : ''}**. ${win ? 'You win!' : 'You lose...'}`, { reply: msg.author });
	}

	private verifyWin(choice: string, result: any) {
		if (dozens.includes(choice) || halves.includes(choice)) {
			const range = choice.split('-');

			return result >= range[0] && range[1] >= result;
		}
		if (colors.includes(choice)) {
			if (choice === 'black') { return black.includes(result); }
			if (choice === 'red') { return red.includes(result); }
		}
		if (parity.includes(choice)) { return parity[result % 2] === choice; }
		if (columns.includes(choice)) { return columns[(result - 1) % 3] === choice; }
		const num = Number.parseInt(choice, 10);
		if (numbers.includes(num)) { return result === num; }
		if (!result) { return false; }

		return false;
	}

}
