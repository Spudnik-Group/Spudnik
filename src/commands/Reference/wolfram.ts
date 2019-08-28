import axios from 'axios';
import { Command, KlasaClient, CommandStore } from 'klasa';

const wolframAppID = process.env.spud_wolframapi;

export default class extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Query Wolfram Alpha with any mathematical question.',
			name: 'wolfram',
			usage: '<query:str>'
		});
	}

	async run(msg, [query]) {
		const pods = await axios.get('http://api.wolframalpha.com/v2/query', {
			params: {
				appid: wolframAppID,
				input: query,
				output: 'json',
				primary: true,
			}
		})
			.then((body: any) => body.body.queryresult.pods)
			.catch(() => { throw 'There was an error. Please try again.'; });

		if (!pods || pods.error) throw "Couldn't find an answer to that question!";

		return msg.sendMessage([
			`**Input Interpretation:** ${pods[0].subpods[0].plaintext}`,
			`**Result:** ${pods[1].subpods[0].plaintext.substring(0, 1500)}`
		].join('\n'));
	}
};
