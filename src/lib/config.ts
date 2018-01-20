import chalk from 'chalk';
import * as fs from 'fs';
import { JsonConvert, JsonObject, JsonProperty } from 'json2typescript';
import { AntiraidSettings } from './antiraid-settings';
import { SettingProviderConfig } from './providers/setting-provider-config';

const configObj: object = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
const jsonConvert: JsonConvert = new JsonConvert();

interface IConfig {
	getDebug(): boolean;
	getCommandPrefix(): string;
	getDatabase(): SettingProviderConfig;
	getPruneInterval(): number;
	getPruneMax(): number;
}

export class Role {
	public default: string;
	public assignable: string[];
}

@JsonObject
export class Configuration implements IConfig {
	public antiraid: { [index: string]: AntiraidSettings } = {};

	public roles: { [index: string]: Role } = {};

	public welcomeMessages: { [index: string]: string } = {};

	@JsonProperty('debug', Boolean)
	private _debug: boolean = false;

	@JsonProperty('commandPrefix', String)
	private _commandPrefix: string = '!';

	@JsonProperty('database', SettingProviderConfig)
	private _database: SettingProviderConfig = new SettingProviderConfig();

	@JsonProperty('pruneInterval', Number)
	private _pruneInterval: number = 10;

	@JsonProperty('pruneMax', Number)
	private _pruneMax: number = 100;

	public getDebug() {
		return this._debug;
	}

	public getCommandPrefix() {
		return this._commandPrefix;
	}

	public getDatabase() {
		return this._database;
	}

	public getPruneInterval() {
		return this._pruneInterval;
	}

	public getPruneMax() {
		return this._pruneMax;
	}

	protected setDebug(debug: boolean) {
		this._debug = debug;
	}

	protected setCommandPrefix(commandPrefix: string) {
		this._commandPrefix = commandPrefix;
	}

	protected setDatabase(database: SettingProviderConfig) {
		this._database = database;
	}

	protected setPruneInterval(interval: number) {
		this._pruneInterval = interval;
	}

	protected setPruneMax(max: number) {
		this._pruneMax = max;
	}
}

export const Config: Configuration = jsonConvert.deserializeObject(configObj, Configuration);
