/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { verify } from '@lib/helpers/base';
import { User } from 'discord.js';
import { getRandomInt, delay } from '@lib/utils/util';

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
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['fight', 'death-battle'],
			description: 'Engage in a turn-based battle against another user or the AI.',
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
	public async run(msg: KlasaMessage, [opp]: [User]): Promise<KlasaMessage | KlasaMessage[]> {
		const fighting = new Set();
		const opponent = opp ? opp : this.client.user;

		if (opponent.id === msg.author.id) {
			return msg.sendSimpleEmbedReply('You may not fight yourself.');
		}

		if (fighting.has(msg.channel.id)) {
			return msg.sendSimpleEmbedReply('Only one fight may be occurring per channel.');
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

			const reset = (changeGuard: boolean = true): void => {
				userTurn = !userTurn;
				if (changeGuard && guard) {
					guard = false;
				}
			};

			const dealDamage = (damage: any): void => {
				if (userTurn) {
					oppoHP -= damage;
				} else {
					userHP -= damage;
				}
			};

			const forfeit = (): void => {
				if (userTurn) {
					userHP = 0;
				} else {
					oppoHP = 0;
				}
			};

			while (userHP > 0 && oppoHP > 0) {
				const user = userTurn ? msg.author : opponent;
				let choice;

				if (!opponent.bot || (opponent.bot && userTurn)) {
					await msg.sendMessage(stripIndents`
						${user}, do you **fight**, **guard**, **special**, or **run**?
						**${msg.author.username}**: ${userHP}HP
						**${opponent.username}**: ${oppoHP}HP
					`);

					const filter = (res: any): boolean =>
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

					await turn.first().delete();
				} else {
					const choices = ['fight', 'guard', 'special'];

					choice = choices[Math.floor(Math.random() * choices.length)];
				}

				if (choice === 'fight') {
					const damage = Math.floor(Math.random() * (guard ? 10 : 100)) + 1;

					await msg.sendMessage(`${user} deals **${damage}** damage!`);

					dealDamage(damage);

					await delay(1500);

					reset();
				} else if (choice === 'guard') {
					await msg.sendMessage(`${user} guards!`);

					guard = true;

					await delay(1500);

					reset(false);
				} else if (choice === 'special') {
					const miss = Math.floor(Math.random() * 4);

					if (miss) {
						await msg.sendMessage(`${user}'s attack missed!`);
					} else {
						const damage = getRandomInt(100, guard ? 150 : 300);

						await msg.sendMessage(`${user} deals **${damage}** damage!`);

						dealDamage(damage);
					}

					await delay(1500);

					reset();
				} else if (choice === 'run') {
					await msg.sendMessage(`${user} flees!`);

					await delay(1500);

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
