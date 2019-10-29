import { Event } from 'klasa';

export default class extends Event {

	run(message) {
		if (this.client.ready) this.client.monitors.run(message);
	}

};
