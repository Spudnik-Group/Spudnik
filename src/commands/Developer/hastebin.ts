import { Command, KlasaClient, CommandStore } from "klasa";
import axios from 'axios';

export default class extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['hb'],
			description: 'Upload code or text to hastebin.',
			usage: '<code:str>'
		});
	}

	async run(msg, [code]) {
		const { data } = await axios.post('https://hastebin.com/documents', code)
		return msg.sendMessage(`https://hastebin.com/${data.key}`);
	}
};
