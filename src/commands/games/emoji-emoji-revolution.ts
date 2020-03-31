/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { verify } from '@lib/helpers/helpers';
const emojis = ['⬆', '↗', '➡', '↘', '⬇', '↙', '⬅', '↖'];

/**
 * Starts a game of Emoji Emoji Revolution.
 *
 * @export
 * @class EmojiEmojiRevolutionCommand
 * @extends {Command}
 */
export default class EmojiEmojiRevolutionCommand extends Command {

	private playing = new Set();

	/**
	 * Creates an instance of EmojiEmojiRevolutionCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof EmojiEmojiRevolutionCommand
	 */
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['eer'],
			description: 'Can you type arrow emoji faster than anyone else has ever typed them before?',
			extendedHelp: 'syntax: \`!emoji-emoji-revolution <@usermention>\`',
			name: 'emoji-emoji-revolution',
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
	public async run(msg: KlasaMessage, [opponent]): Promise<KlasaMessage | KlasaMessage[]> {
		if (opponent.bot) return msg.sendMessage('Bots may not be played against.', { reply: msg.author });
		if (opponent.id === msg.author.id) return msg.sendMessage('You may not play against yourself.', { reply: msg.author });
		if (this.playing.has(msg.channel.id)) return msg.sendMessage('Only one fight may be occurring per channel.', { reply: msg.author });

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

				const filter = (res: any) => [msg.author.id, opponent.id].includes(res.author.id) && res.content === emoji;
				const win: any = await msg.channel.awaitMessages(filter, {
					max: 1,
					time: 30000
				});

				if (!win.size) {
					await msg.sendMessage('Hmm... No one even tried that round.');
					continue;
				}

				const winner = win.first().author;

				if (winner.id === msg.author.id) {
					++aPts;
				} else {
				 ++oPts;
				}

				await msg.sendMessage(stripIndents`
					${winner} won this round!
					**${msg.author.username}**: ${aPts}
					**${opponent.username}**: ${oPts}
				`);
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
