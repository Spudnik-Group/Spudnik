import { stripIndents } from 'common-tags';
import { Message, User } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { verify } from '../../lib/helpers';
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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['eer'],
			args: [
				{
					key: 'opponent',
					prompt: 'What user would you like to play against?',
					type: 'user'
				}
			],
			description: 'Can you type arrow emoji faster than anyone else has ever typed them before?',
			details: 'syntax: \`!emoji-emoji-revolution <@usermention>\`',
			examples: ['!emoji-emoji-revolution @slowtyper71'],
			group: 'game',
			guildOnly: true,
			memberName: 'emoji-emoji-revolution',
			name: 'emoji-emoji-revolution'
		});

	}

	/**
	 * Run the "EmojiEmojiRevolution" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof EmojiEmojiRevolutionCommand
	 */
	public async run(msg: KlasaMessage, args: { opponent: User }): Promise<KlasaMessage | KlasaMessage[]> {
		if (args.opponent.bot) { return msg.reply('Bots may not be played against.'); }
		
		if (args.opponent.id === msg.author.id) { return msg.reply('You may not play against yourself.'); }

		if (this.playing.has(msg.channel.id)) { return msg.reply('Only one fight may be occurring per channel.'); }

		this.playing.add(msg.channel.id);

		try {
			await msg.say(`${args.opponent}, do you accept this challenge?`);

			const verification = await verify(msg.channel, args.opponent);

			if (!verification) {
				this.playing.delete(msg.channel.id);

				return msg.say('Looks like they declined...');
			}

			let turn = 0;
			let aPts = 0;
			let oPts = 0;

			while (turn < 10) {
				++turn;
				const emoji = emojis[Math.floor(Math.random() * emojis.length)];

				await msg.say(emoji);

				const filter = (res: any) => [msg.author.id, args.opponent.id].includes(res.author.id) && res.content === emoji;
				const win: any = await msg.channel.awaitMessages(filter, {
					max: 1,
					time: 30000
				});

				if (!win.size) {
					await msg.say('Hmm... No one even tried that round.');
					continue;
				}

				const winner = win.first().author;

				if (winner.id === msg.author.id) { ++aPts; } else { ++oPts; }

				await msg.say(stripIndents`
					${winner} won this round!
					**${msg.author.username}**: ${aPts}
					**${args.opponent.username}**: ${oPts}
				`);
			}

			this.playing.delete(msg.channel.id);

			if (aPts === oPts) { return msg.say('It\'s a tie!'); }

			const userWin = aPts > oPts;
			
			return msg.say(`You win ${userWin ? msg.author : args.opponent} with ${userWin ? aPts : oPts} points!`);
		} catch (err) {
			this.playing.delete(msg.channel.id);

			throw err;
		}
	}
}
