import { Command, KlasaClient, CommandStore } from "klasa";
import { MessageEmbed } from "discord.js";

export default class extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Shows a user\'s avatar',
			usage: '[user:user]'
		});
	}

	async run(msg, [user = msg.author]) {
		const avatar = user.displayAvatarURL({ size: 512 });

		return msg.sendEmbed(new MessageEmbed()
			.setAuthor(user.username, avatar)
			.setImage(avatar));
	}

};
