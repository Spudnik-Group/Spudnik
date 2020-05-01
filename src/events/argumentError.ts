/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event, KlasaMessage, Command } from 'klasa';

export default class extends Event {

	public run(message: KlasaMessage, command: Command, params: any, error: any): void {
		message.sendSimpleError(error)
			.catch((err: Error) => this.client.emit('wtf', err));
	}

}
