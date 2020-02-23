import { Command, Event, KlasaMessage } from 'klasa';

export default class extends Event {

	public async run(message: KlasaMessage, command: Command, _: string[], error: string | Error) {
		console.log(command, _, error);
	}

}