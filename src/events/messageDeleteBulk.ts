import { Event } from 'klasa';

export default class extends Event {

	run(messages) {
		for (const message of messages.values()) {
			if (message.command && message.command.deletable) {
				for (const msg of message.responses) {
					msg.delete();
				}
			}
		}
	}

};
