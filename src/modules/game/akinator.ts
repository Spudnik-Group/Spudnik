import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, verify } from '../../lib/helpers';
// tslint:disable-next-line
const request = require('node-superfetch');

/**
 * Starts a game of Akinator.
 *
 * @export
 * @class AkinatorCommand
 * @extends {Command}
 */
export default class AkinatorCommand extends Command {
	private sessions = new Map();

	/**
	 * Creates an instance of AkinatorCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof AkinatorCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['the-web-genie', 'web-genie'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Think about a real or fictional character, I will try to guess who it is.',
			examples: ['!akinator'],
			group: 'game',
			guildOnly: true,
			memberName: 'akinator',
			name: 'akinator'
		});

	}

	/**
	 * Run the "Akinator" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof AkinatorCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		if (this.sessions.has(msg.channel.id)) { return msg.reply('Only one game may be occuring per channel.'); }
		try {
			let ans = null;
			this.sessions.set(msg.channel.id, { progression: 0 });
			while (this.sessions.get(msg.channel.id).progression < 95) {
				const data: any = ans === null ? await this.createSession(msg.channel) : await this.progress(msg.channel, ans);
				if (!data || !data.answers || this.sessions.get(msg.channel.id).step >= 80) { break; }
				const answers: any = data.answers.map((answer: any) => answer.answer.toLowerCase());
				answers.push('end');
				await msg.say(stripIndents`
					**${++data.step}.** ${data.question} (${Math.round(Number.parseInt(data.progression, 10))}%)
					${data.answers.map((answer: any) => answer.answer).join(' | ')}
				`);
				const filter = (res: any) => res.author.id === msg.author.id && answers.includes(res.content.toLowerCase());
				const msgs = await msg.channel.awaitMessages(filter, {
					max: 1,
					time: 30000
				});
				if (!msgs.size) {
					await msg.say('Sorry, time is up!');
					break;
				}
				if (msgs.first()!.content.toLowerCase() === 'end') { break; }
				ans = answers.indexOf(msgs.first()!.content.toLowerCase());
			}
			const guess = await this.guess(msg.channel);
			if (!guess) { return sendSimpleEmbeddedError(msg, 'Hmm... I seem to be having a bit of trouble. Check back soon!'); }
			const embed = new MessageEmbed()
				.setColor(getEmbedColor(msg))
				.setTitle(`I'm ${Math.round(guess.proba * 100)}% sure it's...`)
				.setDescription(`${guess.name}${guess.description ? `\n_${guess.description}_` : ''}`)
				.setThumbnail(guess.absolute_picture_path);
			await msg.embed(embed);
			const verification = await verify(msg.channel, msg.author);
			this.sessions.delete(msg.channel.id);
			if (verification === 0) { return msg.say('I guess your silence means I have won.'); }
			if (!verification) { return msg.say('Bravo, you have defeated me.'); }
			return msg.say('Guessed right one more time! I love playing with you!');
		} catch (err) {
			this.sessions.delete(msg.channel.id);
			return sendSimpleEmbeddedError(msg, `Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}

	private async createSession(channel: any) {
		const { body } = await request
			.get('https://srv2.akinator.com:9157/ws/new_session')
			.query({
				_: Date.now(),
				constraint: 'ETAT<>\'AV\'',
				partner: 1,
				player: 'website-desktop',
				question_filter: channel.nsfw ? '' : 'cat=1',
				soft_constraint: channel.nsfw ? '' : 'ETAT=\'EN\''
			});
		const data = body.parameters;
		if (!data) { return null; }
		this.sessions.set(channel.id, {
			id: data.identification.session,
			progression: Number.parseInt(data.step_information.progression, 10),
			signature: data.identification.signature,
			step: 0
		});
		return data.step_information;
	}

	private async progress(channel: any, answer: any) {
		const session = this.sessions.get(channel.id);
		const { body } = await request
			.get('https://srv2.akinator.com:9157/ws/answer')
			.query({
				_: Date.now(),
				answer: answer,
				question_filter: channel.nsfw ? '' : 'cat=1',
				session: session.id,
				signature: session.signature,
				step: session.step
			});
		const data = body.parameters;
		if (!data) { return null; }
		this.sessions.set(channel.id, {
			id: session.id,
			progression: Number.parseInt(data.progression, 10),
			signature: session.signature,
			step: Number.parseInt(data.step, 10)
		});
		return data;
	}

	private async guess(channel: any) {
		const session = this.sessions.get(channel.id);
		const { body } = await request
			.get('https://srv2.akinator.com:9157/ws/list')
			.query({
				_: Date.now(),
				duel_allowed: 1,
				max_pic_height: 294,
				max_pic_width: 246,
				mode_question: 0,
				pref_photos: 'VO-OK',
				session: session.id,
				signature: session.signature,
				size: 2,
				step: session.step
			});
		if (!body.parameters) { return null; }
		return body.parameters.elements[0].element;
	}
}
