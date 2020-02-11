import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';

export default class AvatarCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Shows a user\'s avatar',
			usage: '[user:user]'
		});
	}

	public async run(msg: KlasaMessage, [user = msg.author]): Promise<KlasaMessage | KlasaMessage[]> {
		const avatar = user.displayAvatarURL({ size: 512 });

		return msg.sendEmbed(new MessageEmbed()
			.setAuthor(user.username, avatar)
			.setImage(avatar));
	}
};
