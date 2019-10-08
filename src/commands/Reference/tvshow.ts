import axios from 'axios';
import { Command, KlasaClient, CommandStore } from 'klasa';
import { MessageEmbed } from 'discord.js';

const tmdbAPIkey = process.env.spud_moviedbapi;

module.exports = class extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['tvshows', 'tv', 'tvseries'],
			description: 'Finds a TV show on TMDB.org',
			extendedHelp: 'e.g. `s.tvshow universe, 2`',
			usage: '<Query:str> [Page:number]',
			usageDelim: ','
		});
	}

	async run(msg, [query, page = 1]) {
		const { body } = await axios.get('https://api.themoviedb.org/3/search/tv', {
			params: {
				api_key: tmdbAPIkey,
				query: query
			}
		});
		const show = body.results[page - 1];
		if (!show) throw `I couldn't find a TV show with title **${query}** in page ${page}.`;

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setImage(`https://image.tmdb.org/t/p/original${show.poster_path}`)
			.setTitle(`${show.name} (${page} out of ${body.results.length} results)`)
			.setDescription(show.overview)
			.setFooter(`${this.client.user.username} uses the TMDb API but is not endorsed or certified by TMDb.`,
				'https://www.themoviedb.org/assets/1/v4/logos/408x161-powered-by-rectangle-green-bb4301c10ddc749b4e79463811a68afebeae66ef43d17bcfd8ff0e60ded7ce99.png');
		if (show.title !== show.original_name) embed.addField('Original Title', show.original_name, true);
		embed
			.addField('Vote Count', show.vote_count, true)
			.addField('Vote Average', show.vote_average, true)
			.addField('Popularity', show.popularity, true)
			.addField('First Air Date', show.first_air_date);

		return msg.sendEmbed(embed);
	}
};