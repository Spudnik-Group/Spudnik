/**
 * Copyright (c) 2020 Spudnik Group
 */

import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';
import { SpudConfig } from '@lib/config';

const { tmdbAPIkey } = SpudConfig;

export default class MovieCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['movies', 'film', 'films'],
			description: 'Finds a movie on TMDB.org',
			name: 'movie',
			usage: '<query:string> [page:number]'
		});

		this.customizeResponse('query', 'Please supply a query');
	}

	public async run(msg: KlasaMessage, [query, page = 1]): Promise<KlasaMessage | KlasaMessage[]> {
		if (!tmdbAPIkey) return msg.sendSimpleError('No API Key has been set up. This feature is unusable', 3000);

		try {
			const { data: body } = await axios.get('https://api.themoviedb.org/3/search/movie', {
				params: {
					api_key: tmdbAPIkey,
					query
				}
			});
			const movie = body.results[page - 1];
			if (!movie) return msg.sendSimpleError(`I couldn't find a movie with title **${query}** in page ${page}.`, 3000);

			const embed = new MessageEmbed()
				.setImage(`https://image.tmdb.org/t/p/original${movie.poster_path}`)
				.setTitle(`${movie.title} (${page} out of ${body.results.length} results)`)
				.setDescription(movie.overview)
				.setFooter('Spudnik uses the TMDb API but is not endorsed or certified by TMDb.',
					'https://www.themoviedb.org/assets/1/v4/logos/408x161-powered-by-rectangle-green-bb4301c10ddc749b4e79463811a68afebeae66ef43d17bcfd8ff0e60ded7ce99.png');
			if (movie.title !== movie.original_title) embed.addField('Original Title', movie.original_title, true);
			embed
				.addField('Vote Count', movie.vote_count, true)
				.addField('Vote Average', movie.vote_average, true)
				.addField('Popularity', movie.popularity, true)
				.addField('Adult Content', movie.adult ? 'Yes' : 'No', true)
				.addField('Release Date', movie.release_date);

			return msg.sendEmbed(embed);
		} catch (err) {
			msg.client.emit('warn', `Error in command reference:movie: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

}
