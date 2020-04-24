/**
 * Copyright (c) 2020 Spudnik Group
 */

import { verify } from '@lib/helpers/base';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { User } from 'discord.js';
import { getRandomInt, delay } from '@lib/utils/util';
const words = ['fire', 'draw', 'shoot', 'bang', 'pull'];

/**
 * Starts a game of Gun Fight.
 *
 * @export
 * @class GunFightCommand
 * @extends {Command}
 */
export default class GunFightCommand extends Command {

	private fighting: Set<string> = new Set();

	/**
	 * Creates an instance of GunFightCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof GunFightCommand
	 */
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['western-gunfight'],
			description: 'Engage in a western gunfight against another user. High noon.',
			extendedHelp: 'syntax: \`!gunfight <@usermention>\`',
			name: 'gunfight',
			usage: '<opponent:user>'
		});
	}

	/**
	 * Run the "GunFight" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GunFightCommand
	 */
	public async run(msg: KlasaMessage, [opponent]: [User]): Promise<KlasaMessage | KlasaMessage[]> {
		if (opponent.bot) return msg.sendMessage('Bots may not be fought.', { reply: msg.author });

		if (opponent.id === msg.author.id) return msg.sendMessage('You may not fight yourself.', { reply: msg.author });

		if (this.fighting.has(msg.channel.id)) return msg.sendMessage('Only one fight may be occurring per channel.', { reply: msg.author });

		this.fighting.add(msg.channel.id);

		try {
			await msg.sendMessage(`${opponent}, do you accept this challenge?`);
			const verification = await verify(msg.channel, opponent);

			if (!verification) {
				this.fighting.delete(msg.channel.id);

				return msg.sendMessage('Looks like they declined...');
			}

			await msg.sendMessage('Get Ready...');
			await delay(getRandomInt(1000, 30000));

			const word = words[Math.floor(Math.random() * words.length)];

			await msg.sendMessage(`TYPE \`${word.toUpperCase()}\` NOW!`);

			const filter = (res: any): boolean => [opponent.id, msg.author.id].includes(res.author.id) && res.content.toLowerCase() === word;
			const winner: any = await msg.channel.awaitMessages(filter, {
				max: 1,
				time: 30000
			});

			this.fighting.delete(msg.channel.id);
			if (!winner.size) return msg.sendMessage('Oh... No one won.');

			return msg.sendMessage(`The winner is ${winner.first().author}!`);
		} catch (err) {
			this.fighting.delete(msg.channel.id);
			throw err;
		}
	}

}
