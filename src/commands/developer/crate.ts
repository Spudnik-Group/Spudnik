import axios from 'axios';
import { Command, KlasaClient, CommandStore } from 'klasa';
import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';

const suffixes = ['Bytes', 'KB', 'MB'];
const getBytes = (bytes) => {
	const i = Math.floor(Math.log(bytes) / Math.log(1024));

	return (!bytes && '0 Bytes') || `${(bytes / Math.pow(1024, i)).toFixed(2)} ${suffixes[i]}`;
};

export default class extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Shows the install/publish size of a cargo crate.',
			usage: '<name:string>'
		});
	}

	async run(msg, [name]) {
		const { data } = await axios(`https://crates.io/api/v1/crates/${encodeURIComponent(name)}`);
		const { crate, versions: [latest] } = data;
		if (!crate) throw 'That crate doesn\'t exist.';

		const embed = new MessageEmbed()
			.setColor(15051318)
			.setThumbnail('https://doc.rust-lang.org/cargo/images/Cargo-Logo-Small.png')
			.setTitle(name)
			.setURL(`https://crates.io/crates/${name}`)
			.setDescription(stripIndents`
				${crate.description}

				${crate.documentation ? `[Documentation](${crate.documentation})` : ''} - ${crate.repository ? `[Repository](${crate.repository})` : ''}
			`)
			.addField('Total Downloads', crate.downloads.toLocaleString(), true)
			.addField('Latest Version', stripIndents`
				**Number:** ${latest.num}
				**Size:** ${getBytes(latest.crate_size)}
				**Downloads:** ${latest.downloads.toLocaleString()}
				**License:** ${latest.license}
			`, true);

		if (crate.categories.length) {
			embed.addField('Categories', crate.categories.join(', '), true);
		}
		if (crate.keywords.length) {
			embed.addField('Keywords', crate.keywords.join(', '), true);
		}

		return msg.sendEmbed(embed);
	}
};
