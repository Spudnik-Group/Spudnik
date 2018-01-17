import * as fs from 'fs';
import { JsonConvert, JsonObject, JsonProperty } from 'json2typescript';

const authObj: object = JSON.parse(fs.readFileSync('./config/auth.json', 'utf8'));
const jsonConvert: JsonConvert = new JsonConvert();

interface IAuth {
	getToken(): string;
	getBreweryDbApiKey(): string;
	getDictionaryApiKey(): string;
}

@JsonObject
export class Authorization implements IAuth {
	@JsonProperty('token', String)
	private _token: string = '';

	@JsonProperty('breweryDbApiKey', String)
	private _breweryDbApiKey: string = '';

	@JsonProperty('dictionaryApiKey', String)
	private _dictionaryApiKey: string = '';

	public getToken() {
		return this._token;
	}
	public getBreweryDbApiKey() {
		return this._breweryDbApiKey;
	}
	public getDictionaryApiKey() {
		return this._dictionaryApiKey;
	}

	protected setToken(token: string) {
		this._token = token;
	}
	protected setBreweryDbApiKey(breweryDbApiKey: string) {
		this._breweryDbApiKey = breweryDbApiKey;
	}
	protected setDictionaryApiKey(dictionaryApiKey: string) {
		this._dictionaryApiKey = dictionaryApiKey;
	}
}

export const Auth: Authorization = jsonConvert.deserializeObject(authObj, Authorization);
