import { Finalizer } from 'klasa';

export default class extends Finalizer {

	async run(msg) {
		if (msg.guild && msg.guild.settings.deleteCommandMessages && msg.deletable) await msg.delete();
	}

};
