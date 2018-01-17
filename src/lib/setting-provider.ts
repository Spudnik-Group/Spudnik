import { Guild } from 'discord.js';
import { JsonObject, JsonProperty } from 'json2typescript/src/json2typescript/json-convert-decorators';

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
	public get(guild: Guild, key: string, defaultVal: any) { throw new Error(`${this.constructor.name} doesn't have a get method.`); }

	public set(guild: Guild, key: string, val: any) { throw new Error(`${this.constructor.name} doesn't have a set method.`); }

	public remove(guild: Guild, key: string) { throw new Error(`${this.constructor.name} doesn't have a remove method.`); }

	public clear(guild: Guild) { throw new Error(`${this.constructor.name} doesn't have a clear method.`); }
}
