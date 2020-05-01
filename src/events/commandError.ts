/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event, KlasaMessage, Command } from 'klasa';

export default class extends Event {

	public run(message: KlasaMessage, command: Command, params: any, error: any): void {
		if (error instanceof Error) {
			this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);
		}

		if (error.message) {
			message.sendCode('JSON', error.message)
				.catch((err: Error) => this.client.emit('wtf', err));
		} else {
			message.sendSimpleError(error)
				.catch((err: Error) => this.client.emit('wtf', err));
		}
	}

}
