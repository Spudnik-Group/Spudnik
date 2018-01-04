module.exports = class antiraidSettings {
	constructor(guild, settings) {
		this.settings = settings;
		this.recentMembers = [];
		this.kicking = false;
	}

	static settingTypes() {
		return {
			channelId: 'string',
			limit: 'int',
			seconds: 'int'
		};
	}
};
