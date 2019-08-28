import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
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
			args: [
				{
					infinite: true,
					key: 'choices',
					max: 70,
					min: 1,
					prompt: 'What numbers do you choose? Only the first six will be counted.',
					type: 'integer'
				}
			],
			description: 'Attempt to win the lottery with 6 numbers.',
			details: 'syntax: \`!lottery <choices>\`',
			examples: ['!lottery 12 14 45 66 55 23'],
			group: 'game',
			guildOnly: true,
			memberName: 'lottery',
			name: 'lottery'
		});
	}

	/**
	 * Run the "Lottery" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof LotteryCommand
	 */
	public async run(msg: KlasaMessage, args: { choices: number[] }): Promise<KlasaMessage | KlasaMessage[]> {
		const lotto = Array.from({ length: 6 }, () => Math.floor(Math.random() * 70) + 1);
		const similarities = lotto.filter((num, i) => args.choices[i] === num).length;
		
		return msg.reply(stripIndents`
			${lotto.join(', ')}
			You matched **${similarities}** numbers, which gives you **${prizes[similarities]}**! Congrats!
		`);
	}
}
