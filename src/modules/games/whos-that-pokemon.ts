import { createCanvas } from 'canvas';
import chalk from 'chalk';
import { stripIndents } from 'common-tags';
import { Message, MessageEmbed, User } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { RequestResponse } from 'request';
import * as rp from 'request-promise';
import { getEmbedColor } from '../../lib/custom-helpers';
import { randomRange, sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, verify } from '../../lib/helpers';

/**
 * A Game for guessing a pokemon from an image.
 *
 * @export
 * @class WhosThatPokemonCommand
 * @extends {Command}
 */
export default class WhosThatPokemonCommand extends Command {
	/**
	 * Creates an instance of WhosThatPokemonCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof WhosThatPokemonCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['who-pokemon', 'whos-that-pokémon', 'who-pokémon'],
			args: [
				{
					default: false,
					key: 'hide',
					prompt: 'Do you want to silhouette the Pokémon\'s image?',
					type: 'boolean'
				}
			],
			clientPermissions: ['ATTACH_FILES'],
			description: 'Guess who that Pokémon is.',
			group: 'games',
			memberName: 'whos-that-pokemon',
			name: 'whos-that-pokemon',
			throttling: {
				duration: 10,
				usages: 1
			}
		});
	}

	/**
	 * Run the "WhosThatPokemon" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof WhosThatPokemonCommand
	 */
	public async run(msg: CommandMessage, args: { hide: boolean }): Promise<Message | Message[]> {
		const pokemon = Math.floor(Math.random() * 802) + 1;
		try {
			const data = await this.fetchPokemon(pokemon);
			const names = data.names.map((name: any) => name.name.toLowerCase());
			const displayName = data.names.filter((name: any) => name.language.name === 'en')[0].name;
			const id = data.id.toString().padStart(3, '0');
			const attachment = await this.fetchImage(id, args.hide);
			await msg.reply('**You have 15 seconds, who\'s that Pokémon?**', { files: [{ attachment: attachment, name: `${id}.png` }] });
			const msgs = await msg.channel.awaitMessages((res: any) => res.author.id === msg.author.id, {
				max: 1,
				time: 15000
			});
			if (!msgs.size) { return msg.reply(`Sorry, time is up! It was ${displayName}.`); }
			if (!names.includes(msgs.first()!.content.toLowerCase())) { return msg.reply(`Nope, sorry, it's ${displayName}.`); }
			return msg.reply('Nice job! 10/10! You deserve some cake!');
		} catch (err) {
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}

	private async fetchPokemon(pokemon: any) {
		if (this.cache.has(pokemon)) { return this.cache.get(pokemon); }
		const { body } = await request.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}/`);
		this.cache.set(body.id, {
			id: body.id,
			names: body.names
		});
		return body;
	}

	private async fetchImage(id: any, hide = false) {
		const image = await request.get(`https://www.serebii.net/sunmoon/pokemon/${id}.png`);
		if (!hide) return image.body;
		const base = await loadImage(image.body);
		const canvas = createCanvas(base.width, base.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(base, 0, 0);
		silhouette(ctx, 0, 0, base.width, base.height);
		return canvas.toBuffer();
	}
}
