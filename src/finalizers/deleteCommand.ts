import { Finalizer, KlasaMessage } from 'klasa';

export default class extends Finalizer {

	async run(msg: KlasaMessage) {
		if (msg.guild && msg.guild.settings.get('deleteCommandMessages') && msg.deletable) await msg.delete();
	}

};
