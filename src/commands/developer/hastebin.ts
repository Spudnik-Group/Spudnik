/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, KlasaClient, CommandStore } from 'klasa';
import axios from 'axios';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

export default class HastebinCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['hb'],
			description: 'Upload code or text to hastebin.',
			usage: '<code:...string>'
		});
	}

	async run(msg, [code]) {
		try {
			const { data } = await axios.post('https://hastebin.com/documents', code);
	
			return msg.sendMessage(`https://hastebin.com/${data.key}`);
		} catch (err) {
			msg.client.emit('warn', `Error in command dev:hastebin: ${err}`);

			return sendSimpleEmbeddedError(msg, 'Couldn\'t create the hastebin post, the post body may have been invalid. Try again?');
		}
	}
};
