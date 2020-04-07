import { Event } from 'klasa';

export default class extends Event {

	public run(message: any, command: any, params: any, error: any): void {
		if (error instanceof Error) this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);
		if (error.message) message.sendCode('JSON', error.message).catch((err: Error) => this.client.emit('wtf', err));
		else message.sendMessage(error).catch((err: Error) => this.client.emit('wtf', err));
	}

}
