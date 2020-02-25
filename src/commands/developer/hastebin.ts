/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import axios from 'axios';

export default class HastebinCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['hb'],
			description: 'Upload code or text to hastebin.',
			usage: '<code:...string>'
		});
	}

	public async run(msg: KlasaMessage, [code]: [string]) {
		try {
			const { data } = await axios.post('https://hastebin.com/documents', code);

			return msg.sendMessage(`https://hastebin.com/${data.key}`);
		} catch (err) {
			msg.client.emit('warn', `Error in command dev:hastebin: ${err}`);

			return msg.sendSimpleError('Couldn\'t create the hastebin post, the post body may have been invalid. Try again?');
		}
	}

}
