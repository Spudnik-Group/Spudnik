import { Monitor, KlasaClient, MonitorStore } from "klasa";

export default class extends Monitor {
	constructor(client: KlasaClient, store: MonitorStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			name: 'invitedetection',
			enabled: true,
			ignoreSelf: true,
			ignoreOthers: false
		});
	}

	async run(msg) {
		if (!msg.guild || !msg.guild.settings['adblockEnabled']) return null;
		if (await msg.hasAtLeastPermissionLevel(6)) return null;
		if (!/(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/.test(msg.content)) return null;
		return msg.delete()
			.catch(err => this.client.emit('log', err, 'error'));
	}
};
