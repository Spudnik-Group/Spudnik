export class AntiraidSettings {
	private _settings: object;
	private _recentMembers: object;
	private _kicking: boolean;

	constructor(guild: string, settings: object) {
		this._settings = settings;
		this._recentMembers = [];
		this._kicking = false;
	}
};
