import axios from 'axios';
import { Command, KlasaClient, CommandStore } from 'klasa';
import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

const tmdbAPIkey = process.env.spud_moviedbapi;

export default class MovieCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['movies', 'film', 'films'],
			description: 'Finds a movie on TMDB.org',
			extendedHelp: stripIndents`
				syntax: \`!movie <query> [page]\`
			`,
			usage: '<query:string> [page:number]',
			name: 'movie'
		});
	}

	async run(msg, [query, page = 1]) {
		const { data: body } = await axios.get('https://api.themoviedb.org/3/search/movie', {
			params: {
				api_key: tmdbAPIkey,
				query: query
			}
		});
		const movie = body.results[page - 1];
		if (!movie) sendSimpleEmbeddedError(msg, `I couldn't find a movie with title **${query}** in page ${page}.`, 3000);

		const embed = new MessageEmbed()
			.setImage(`https://image.tmdb.org/t/p/original${movie.poster_path}`)
			.setTitle(`${movie.title} (${page} out of ${body.results.length} results)`)
			.setDescription(movie.overview)
			.setFooter(`Spudnik uses the TMDb API but is not endorsed or certified by TMDb.`,
				'https://www.themoviedb.org/assets/1/v4/logos/408x161-powered-by-rectangle-green-bb4301c10ddc749b4e79463811a68afebeae66ef43d17bcfd8ff0e60ded7ce99.png');
		if (movie.title !== movie.original_title) embed.addField('Original Title', movie.original_title, true);
		embed
			.addField('Vote Count', movie.vote_count, true)
			.addField('Vote Average', movie.vote_average, true)
			.addField('Popularity', movie.popularity, true)
			.addField('Adult Content', movie.adult ? 'Yes' : 'No', true)
			.addField('Release Date', movie.release_date);

		return msg.sendEmbed(embed);
	}
};
