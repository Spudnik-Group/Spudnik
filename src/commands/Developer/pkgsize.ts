import { Command, KlasaClient, CommandStore } from "klasa";
import axios from 'axios';
import { stripIndents } from "common-tags";

const suffixes = ['Bytes', 'KB', 'MB', 'GB'];
const getBytes = (bytes) => {
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return (!bytes && '0 Bytes') || `${(bytes / Math.pow(1024, i)).toFixed(2)} ${suffixes[i]}`;
};

export default class extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Shows the install/publish size of a npm package.',
			usage: '<name:str>'
		});
	}

	async run(msg, [name]) {
		const { data } = await axios(`https://packagephobia.now.sh/api.json?p=${encodeURIComponent(name)}`);
		const { publishSize, installSize } = data;
		if (!publishSize && !installSize) throw 'That package doesn\'t exist.';

		return msg.send(stripIndents`
			<https://www.npmjs.com/package/${name}>

			**Publish Size:** ${getBytes(publishSize)}
			**Install Size:** ${getBytes(installSize)}
		`);
	}
};
