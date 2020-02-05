import { stripIndents } from 'common-tags';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
const prizes = ['$0', '$2', '$4', '$10', '$500', '$1,000,000', 'the Jackpot'];

/**
 * Starts a game of Lottery.
 *
 * @export
 * @class LotteryCommand
 * @extends {Command}
 */
export default class LotteryCommand extends Command {
	/**
	 * Creates an instance of LotteryCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof LotteryCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['lotto'],
			description: 'Attempt to win the lottery with 6 numbers.',
			extendedHelp: 'syntax: \`!lottery <choices>\`',
			name: 'lottery',
			usage: '<choice:int{1,70}> [...]'
		});
	}

	/**
	 * Run the "Lottery" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof LotteryCommand
	 */
	public async run(msg: KlasaMessage, [...choices]): Promise<KlasaMessage | KlasaMessage[]> {
		const lotto = Array.from({ length: 6 }, () => Math.floor(Math.random() * 70) + 1);
		const similarities = lotto.filter((num, i) => choices[i] === num).length;

		return msg.sendMessage(stripIndents`
			${lotto.join(', ')}
			You matched **${similarities}** numbers, which gives you **${prizes[similarities]}**! Congrats!
		`, { reply: msg.author });
	}
}