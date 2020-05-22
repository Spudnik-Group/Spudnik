/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { verify } from '@lib/helpers/base';
import { User, Message } from 'discord.js';
import { delay } from '@lib/utils/util';
const emojis = ['⬆', '↗', '➡', '↘', '⬇', '↙', '⬅', '↖'];

/**
 * Starts a game of Emoji Emoji Revolution.
 *
 * @export
 * @class EmojiEmojiRevolutionCommand
 * @extends {Command}
 */
export default class EmojiEmojiRevolutionCommand extends Command {

	private playing: Set<string> = new Set();

	/**
	 * Creates an instance of EmojiEmojiRevolutionCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof EmojiEmojiRevolutionCommand
	 */
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['eer', 'emojiemojirevolution'],
			description: 'Can you type arrow emoji faster than anyone else has ever typed them before?',
			usage: '<opponent:user>'
		});

	}

	/**
	 * Run the "EmojiEmojiRevolution" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof EmojiEmojiRevolutionCommand
	 */
	public async run(msg: KlasaMessage, [opponent]: [User]): Promise<KlasaMessage | KlasaMessage[]> {
		if (opponent.bot) return msg.sendSimpleEmbedReply('Bots may not be played against.');
		if (opponent.id === msg.author.id) return msg.sendSimpleEmbedReply('You may not play against yourself.');
		if (this.playing.has(msg.channel.id)) return msg.sendSimpleEmbedReply('Only one fight may be occurring per channel.');

		this.playing.add(msg.channel.id);

		try {
			await msg.sendMessage(`${opponent}, do you accept this challenge?`);

			const verification = await verify(msg.channel, opponent);

			if (!verification) {
				this.playing.delete(msg.channel.id);

				return msg.sendMessage('Looks like they declined...');
			}

			let turn = 0;
			let aPts = 0;
			let oPts = 0;

			while (turn < 10) {
				++turn;
				const emoji = emojis[Math.floor(Math.random() * emojis.length)];

				await msg.sendMessage(emoji);

				const filter = (res: any): boolean => [msg.author.id, opponent.id].includes(res.author.id) && res.content === emoji;
				const win: any = await msg.channel.awaitMessages(filter, {
					max: 1,
					time: 30000
				});

				if (!win.size) {
					await msg.sendMessage('Hmm... No one even tried that round.');

					await delay(1500);

					continue;
				}

				const winner = win.first().author;

				if (winner.id === msg.author.id) {
					++aPts;
				} else {
					++oPts;
				}

				await win.array().forEach((message: Message) => message.delete());

				await msg.sendMessage(stripIndents`
					${winner} won this round!
					**${msg.author.username}**: ${aPts}
					**${opponent.username}**: ${oPts}
				`);

				await delay(1500);
			}

			this.playing.delete(msg.channel.id);

			if (aPts === oPts) return msg.sendMessage('It\'s a tie!');

			const userWin = aPts > oPts;

			return msg.sendMessage(`You win ${userWin ? msg.author : opponent} with ${userWin ? aPts : oPts} points!`);
		} catch (err) {
			this.playing.delete(msg.channel.id);

			throw err;
		}
	}

}
