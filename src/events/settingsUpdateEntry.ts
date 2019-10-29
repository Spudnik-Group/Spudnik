import { Event } from 'klasa';
const gateways = ['users', 'clientStorage'];

export default class extends Event {

	run(settings) {
		if (gateways.includes(settings.gateway.type)) {
			this.client.shard.broadcastEval(`
				if (String(this.shard.id) !== '${this.client.shard.id}') {
					const entry = this.gateways.${settings.gateway.type}.get('${settings.id}');
					if (entry) {
						entry._patch(${JSON.stringify(settings)});
						entry._existsInDB = true;
					}
				}
			`);
		}
	}

	init() {
		if (!this.client.shard) this.disable();
	}

};
