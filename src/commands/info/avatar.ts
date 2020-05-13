/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { User } from 'discord.js';

export default class AvatarCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows a user\'s avatar',
			usage: '(user:optional-user)'
		});
	}

	public async run(msg: KlasaMessage, [user = msg.author]: [User]): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendEmbed(baseEmbed(msg)
			.addField('Avatar', user.tag)
			.setImage(user.displayAvatarURL({ size: 512 })));
	}

}
