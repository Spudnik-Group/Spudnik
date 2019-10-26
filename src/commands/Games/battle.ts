import { stripIndents } from 'common-tags';
import { getRandomInt, verify } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Allows users to battle each other or the bot.
 *
 * @export
 * @class BattleCommand
 * @extends {Command}
 */
export default class BattleCommand extends Command {
	/**
	 * Creates an instance of BattleCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof BattleCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['fight', 'death-battle'],
			description: 'Engage in a turn-based battle against another user or the AI.',
			extendedHelp: 'syntax: \`!battle (@usermention)\`',
			name: 'battle',
			usage: '(opponent:user)'
		});
	}

	/**
	 * Run the "battle" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof BattleCommand
	 */
	public async run(msg: KlasaMessage, [opp]): Promise<KlasaMessage | KlasaMessage[]> {
		const fighting = new Set();
		const opponent = opp ? opp : this.client.user
		
		if (opponent.id === msg.author.id) {
			return msg.sendMessage('You may not fight yourself.', { reply: msg.author });
		}

		if (fighting.has(msg.channel.id)) {
			return msg.sendMessage('Only one fight may be occurring per channel.', { reply: msg.author });
		}

		fighting.add(msg.channel.id);

		try {
			if (!opponent.bot) {
				await msg.sendMessage(`${opponent}, do you accept this challenge?`);

				const verification = await verify(msg.channel, opponent);

				if (!verification) {
					fighting.delete(msg.channel.id);

					return msg.sendMessage('Looks like they declined...');
				}
			}
			let userHP = 500;
			let oppoHP = 500;
			let userTurn = false;
			let guard = false;

			const reset = (changeGuard = true) => {
				userTurn = !userTurn;
				if (changeGuard && guard) {
					guard = false;
				}
			}

			const dealDamage = (damage: any) => {
				if (userTurn) {
					oppoHP -= damage;
				} else {
					userHP -= damage;
				}
			}

			const forfeit = () => {
				if (userTurn) {
					userHP = 0;
				} else {
					oppoHP = 0;
				}
			}
			
			while (userHP > 0 && oppoHP > 0) {
				const user = userTurn ? msg.author : opponent;
				let choice;

				if (!opponent.bot || (opponent.bot && userTurn)) {
					await msg.sendMessage(stripIndents`
						${user}, do you **fight**, **guard**, **special**, or **run**?
						**${msg.author.username}**: ${userHP}HP
						**${opponent.username}**: ${oppoHP}HP
					`);
					const filter = (res: any) =>
						res.author.id === user.id && ['fight', 'guard', 'special', 'run'].includes(res.content.toLowerCase());
					const turn = await msg.channel.awaitMessages(filter, {
						max: 1,
						time: 30000
					});
					if (!turn.size) {
						await msg.sendMessage('Sorry, time is up!');
						reset();
						continue;
					}
					choice = turn.first()!.content.toLowerCase();
				} else {
					const choices = ['fight', 'guard', 'special'];
					choice = choices[Math.floor(Math.random() * choices.length)];
				}

				if (choice === 'fight') {
					const damage = Math.floor(Math.random() * (guard ? 10 : 100)) + 1;
					await msg.sendMessage(`${user} deals **${damage}** damage!`);
					dealDamage(damage);
					reset();
				} else if (choice === 'guard') {
					await msg.sendMessage(`${user} guards!`);
					guard = true;
					reset(false);
				} else if (choice === 'special') {
					const miss = Math.floor(Math.random() * 4);
					if (!miss) {
						const damage = getRandomInt(100, guard ? 150 : 300);
						await msg.sendMessage(`${user} deals **${damage}** damage!`);
						dealDamage(damage);
					} else {
						await msg.sendMessage(`${user}'s attack missed!`);
					}
					reset();
				} else if (choice === 'run') {
					await msg.sendMessage(`${user} flees!`);
					forfeit();
					break;
				} else {
					await msg.sendMessage('I do not understand what you want to do.');
				}
			}

			fighting.delete(msg.channel.id);

			const winner = userHP > oppoHP ? msg.author : opponent;
			
			return msg.sendMessage(`The match is over! Congrats, ${winner}!`);
		} catch (err) {
			fighting.delete(msg.channel.id);
			throw err;
		}
	}
}
