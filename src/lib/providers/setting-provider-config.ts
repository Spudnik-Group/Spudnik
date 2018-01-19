import { Guild } from 'discord.js';
import { JsonObject, JsonProperty } from 'json2typescript';

interface ISettingProviderConfig {
	getConnection(): string;
	getOptions(): object;
}

@JsonObject
export class SettingProviderConfig implements ISettingProviderConfig {
	@JsonProperty('connection', String)
	private _connection: string = '';

	@JsonProperty('options', [Object])
	private _options: object = {};

	public getConnection() {
		return this._connection;
	}

	public getOptions() {
		return this._options;
	}

	protected setConnection(connection: string) {
		this._connection = connection;
	}

	protected setOptions(options: object) {
		this._options = options;
	}
}
