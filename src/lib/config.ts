import * as fs from 'fs';
import chalk from 'chalk';
import { JsonConvert, JsonObject, JsonProperty } from 'json2typescript';
import { SettingProviderConfig } from './setting-provider';

const configObj: object = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
const jsonConvert: JsonConvert = new JsonConvert();

interface IConfig {
	getDebug(): boolean;
	getCommandPrefix(): string;
	getDatabase(): SettingProviderConfig;
	getElizaEnabled(): boolean;
	getPruneInterval(): number;
	getPruneMax(): number;
	getDefaultEmbedColor(): number;
}

export class Role {
	public default: string;
	public assignable: string[];
}

@JsonObject
export class Configuration implements IConfig {
	@JsonProperty("debug", Boolean)
	private _debug: boolean = false;

	@JsonProperty("commandPrefix", String)
	private _commandPrefix: string = '!';

	@JsonProperty("database", SettingProviderConfig)
	private _database: SettingProviderConfig = new SettingProviderConfig();

	@JsonProperty("elizaEnabled", Boolean)
	private _elizaEnabled: boolean = false;

	@JsonProperty("pruneInterval", Number)
	private _pruneInterval: number = 10;

	@JsonProperty("pruneMax", Number)
	private _pruneMax: number = 100;

	@JsonProperty("defaultEmbedColor", Number)
	private _defaultEmbedColor: number = 5592405;

	public roles: { [index: string]: Role } = {};

	public getDebug() {
		return this._debug;
	}

	public getCommandPrefix() {
		return this._commandPrefix;
	}

	public getDatabase() {
		return this._database;
	}

	public getElizaEnabled() {
		return this._elizaEnabled;
	}

	public getPruneInterval() {
		return this._pruneInterval;
	}

	public getPruneMax() {
		return this._pruneMax;
	}

	public getDefaultEmbedColor() {
		return this._defaultEmbedColor;
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

	protected setElizaEnabled(enabled: boolean) {
		this._elizaEnabled = enabled;
	}

	protected setPruneInterval(interval: number) {
		this._pruneInterval = interval;
	}

	protected setPruneMax(max: number) {
		this._pruneMax = max;
	}

	protected setDefaultEmbedColor(color: number) {
		this._defaultEmbedColor = color;
	}
}

export const Config: Configuration = jsonConvert.deserializeObject(configObj, Configuration);