import { DiscordAPIError, HTTPError } from 'discord.js';
import { Command, Event, KlasaMessage, util } from 'klasa';

const BLACKLISTED_CODES = [
	// Unknown Channel
	10003,
	// Unknown Message
	10008
];

export default class extends Event {

	public async run(message: KlasaMessage, command: Command, _: string[], error: string | Error) {
		if (typeof error === 'string') {
			try {
				await message.send(error);
			} catch (err) {
				this.client.emit('api', err);
			}
		} else {
			// Extract useful information about the DiscordAPIError
			if (error instanceof DiscordAPIError || error instanceof HTTPError) {
				if (BLACKLISTED_CODES.includes(error.code)) return;
				this.client.emit('api', error);
			} else {
				this.client.emit('warn', `${this._getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
			}

			// Emit where the error was emitted
			this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);
			try {
				await message.send(util.codeBlock('js', error.stack!));
			} catch (err) {
				this.client.emit('api', err);
			}
		}
	}

	private _getWarnError(message: KlasaMessage) {
		return `ERROR: /${message.guild ? `${message.guild.id}/${message.channel.id}` : `DM/${message.author.id}`}/${message.id}`;
	}

}