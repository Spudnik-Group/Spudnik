import { oneLine } from 'common-tags';
import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			args: [
				{
					key: 'space',
					parse: (space: string) => space.toLowerCase(),
					prompt: 'What space do you want to bet on?',
					type: 'string',
					validate: (space: string) => {
						if (numbers.includes(Number.parseInt(space, 10))) { return true; }
						if (dozens.includes(space)) { return true; }
						if (halves.includes(space)) { return true; }
						if (columns.includes(space.toLowerCase())) { return true; }
						if (parity.includes(space.toLowerCase())) { return true; }
						if (colors.includes(space.toLowerCase())) { return true; }
						
						return oneLine`
							Invalid space, please enter either a specific number from 0-36, a range of dozens (e.g. 1-12), a range of
							halves (e.g. 1-18), a column (e.g. 1st), a color (e.g. black), or a parity (e.g. even).
						`;
					}
				}
			],
			description: 'Play a game of roulette.',
			details: 'syntax: \`!roulette <space choice>\`',
			examples: ['!roulette 1-18', '!roulette 2'],
			group: 'game',
			guildOnly: true,
			memberName: 'roulette',
			name: 'roulette'
		});

	}

	/**
	 * Run the "Roulette" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof RouletteCommand
	 */
	public async run(msg: KlasaMessage, args: { space: string }): Promise<KlasaMessage | KlasaMessage[]> {
		const num: number = Math.floor(Math.random() * 37);
		const color = num ? red.includes(num) ? 'RED' : 'BLACK' : null;
		const win = this.verifyWin(args.space, num);
		
		return msg.reply(`The result is **${num}${color ? ` ${color}` : ''}**. ${win ? 'You win!' : 'You lose...'}`);
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
