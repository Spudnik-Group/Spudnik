const chalk = require('chalk');
const AntiraidSettings = require('../classes/antiraid-settings');
const GuildAntiraidSettingsSchema = require('../classes/guild-antiraid-settings-schema');

module.exports = Spudnik => {
	Spudnik.Config.antiraid = {};

	const GuildAntiraidSettings = Spudnik.Database.model('GuildAntiraidSettings', GuildAntiraidSettingsSchema);

	return {
		commands: [
			'antiraid'
		],
		antiraid: {
			usage: '<parameter> <new value?>',
			description: 'Accesses the servers antiraid parameters. Adding a value will update the parameter.',
			process: (msg, suffix, isEdit, cb) => {
				const parameters = suffix.split(' ');
				const parameter = parameters.shift().trim();
				const settingTypes = AntiraidSettings.settingTypes();

				// There must be at least one parameter passed to the command.
				if (parameter === '') {
					cb(`Please specify a property of the antiraid settings. \nAvailable properties: ${Object.keys(settingTypes).join(', ')}.`, msg);
					return;
				}

				// Get the antiraid settings for the guild that the command was run from or instantiate it if it doesn't already exist.
				let antiraidSettings = Spudnik.Config.antiraid[msg.guild.id];
				if (!antiraidSettings) {
					const guild = Spudnik.Discord.guilds.find('id', msg.guild.id);
					if (!guild) {
						cb('Unable to set your guild settings for antiraid.', msg);
						return;
					}
					const settings = new GuildAntiraidSettings({
						guildId: guild.id,
						channelId: guild.id
					});
					Spudnik.Config.antiraid[msg.guild.id] = new AntiraidSettings(guild, settings);
					antiraidSettings = Spudnik.Config.antiraid[msg.guild.id];
				}

				// Only some values of the antiraid are allowed to be viewed and updated.
				const settingType = settingTypes[parameter];
				if (!settingType) {
					cb(`That property is not available.`, msg);
					return;
				}

				// If there is only one parameter, we just want to display the current value.
				let value = antiraidSettings.settings[parameter];
				if (parameters.length === 0) {
					if (settingType === 'encodedString') {
						value = unescape(value);
					}

					cb(`That ${parameter} antiraid setting is currently set to '${value}'.`, msg);
					return;
				}

				// Ensure that the value is properly typed for the antraid setting.
				value = parameters.join(' ').trim();
				let message = `The ${parameter} antiraid setting has been set to '${value}'.`;
				switch (settingType) {
					case 'int':
						value = Math.max(0, Number.parseInt(value, 10));
						break;
					case 'encodedString':
						value = escape(value);
						break;
					default:
						break;

				}

				// Attempt to set the value of the parameter.
				try {
					antiraidSettings.settings[parameter] = value;
					GuildAntiraidSettings.findOneAndUpdate(
						{ guildId: antiraidSettings.settings.guildId },
						antiraidSettings.settings,
						{ upsert: true },
						error => {
							if (error) {
								console.log(chalk.red(`Error: ${error}`));
								cb(`Something went wrong saving the ${parameter} value. This change will be lost on the next Spudnik restart.`, msg);
							}
						}
					);
				} catch (err) {
					console.log(chalk.red(`Error: ${err}`));
					message = 'Something went wrong setting the antiraid setting.';
				}

				// Display a message when done.
				cb(message, msg);
			}
		}
	};
};
