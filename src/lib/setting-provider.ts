import { Guild } from 'discord.js';
import { JsonProperty, JsonObject } from 'json2typescript/src/json2typescript/json-convert-decorators';

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

export class SettingProvider {
	get(guild: Guild, key: string, defaultVal: any) { throw new Error(`${this.constructor.name} doesn't have a get method.`); }

	set(guild: Guild, key: string, val: any) { throw new Error(`${this.constructor.name} doesn't have a set method.`); }

	remove(guild: Guild, key: string) { throw new Error(`${this.constructor.name} doesn't have a remove method.`); }

	clear(guild: Guild) { throw new Error(`${this.constructor.name} doesn't have a clear method.`); }
}