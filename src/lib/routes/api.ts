import * as express from 'express';

// TODO: make this dynamic use fs
const commandMap = {
	convert: [
		'base64decode',
		'base64encode',
		'bin2dec',
		'bin2hex',
		'dec2bin',
		'dec2hex',
		'hex2bin',
		'hex2dec'
	],
	dev: [
		'github',
		'mdn',
		'npm',
		'stack-overflow'
	],
	facts: [
		'cat-fact',
		'chuck-fact',
		'date-fact',
		'dog-fact',
		'math-fact',
		'smiff-fact',
		'year-fact'
	],
	game: [
		'apples-to-apples',
		'balloon-pop',
		'battle',
		'cards-against-humanity',
		'chance',
		'emoji-emoji-revolution',
		'fishy',
		'google-fued',
		'gunfight',
		'hangman',
		'hunger-games',
		'lottery',
		'mafia',
		'math-quiz',
		'quiz',
		'rock-paper-scissors',
		'roulette',
		'slots',
		'sorting-hat-quiz',
		'tic-tac-toe',
		'typing-test',
		'wizard-convention'
	],
	gaming: [
		'apex-legends-stats',
		'codbo4-stats',
		'codwwii-stats',
		'csgo-stats',
		'fortnite-stats',
		'go',
		'overwatch-stats',
		'r6-stats'
	],
	meme: [
		'gitgud',
		'highnoon'
	],
	misc: [
		'lmgtfy',
		'playing',
		'say',
		'strawpoll',
		'unshort',
		'xkcd'
	],
	mod: [
		'ban',
		'clear-warn',
		'kick',
		'list-warns',
		'move',
		'prune',
		'unban',
		'warn'
	],
	random: [
		'8ball',
		'bacon',
		'choose',
		'coinflip',
		'dice'
	],
	ref: [
		'beer-lookup',
		'cocktail-lookup',
		'dictionary',
		'urbandictionary',
		'wikipedia'
	],
	roles: [
		'accept',
		'iam',
		'iamnot',
		'role',
		'roles'
	],
	translate: [
		'leet',
		'yodafy'
	],
	util: [
		'nick',
		'pong',
		'server',
		'stats',
		'topic',
		'user'
	]
};

export default express.Router()
	.get('/', (req, res) => {
		res.send('api works');
	})
// return Discord user object
	.get('/info', checkAuth, (req, res) => {
		res.json(req.user);
	})
// return status of all features and groups
	.get('/info/guild/:guildId', checkAuth, async (req, res) => {
		const { guildId } = req.params;
		// TODO: fix all this guild setting shit. This should be pulling from the client
		const currentGuildDoc = await GuildSettings.findOne({ guild: guildId });
		const settings = JSON.parse(currentGuildDoc.settings);
		const response = {
			features: {
				prefix: settings.prefix ? settings.prefix : '!',
				adblock: settings.adblockEnabled ? settings.adblockEnabled : false,
				commandMessages: settings.deleteCommandMessage ? settings.deleteCommandMessage : false,
				embedColor: settings.embedColor ? settings.embedColor : '555555',
				modlog: settings.modlogEnabled ? settings.modlogEnabled : false,
				starboard: settings.starboardEnabled ? settings.starboardEnabled : false,
				welcome: settings.welcomeEnabled ? settings.welcomeEnabled : false,
				goodbye: settings.goodbyeEnabled ? settings.goodbyeEnabled : false
			},
			groups: {
				convert: settings['grp-convert'] ? settings['grp-convert'] : true,
				dev: settings['grp-dev'] ? settings['grp-dev'] : true,
				facts: settings['grp-facts'] ? settings['grp-facts'] : true,
				game: settings['grp-game'] ? settings['grp-game'] : true,
				gaming: settings['grp-gaming'] ? settings['grp-gaming'] : true,
				meme: settings['grp-meme'] ? settings['grp-meme'] : true,
				misc: settings['grp-misc'] ? settings['grp-misc'] : true,
				mod: settings['grp-mod'] ? settings['grp-mod'] : true,
				random: settings['grp-random'] ? settings['grp-random'] : true,
				ref: settings['grp-ref'] ? settings['grp-ref'] : true,
				roles: settings['grp-roles'] ? settings['grp-roles'] : true,
				translate: settings['grp-translate'] ? settings['grp-translate'] : true,
				util: settings['grp-util'] ? settings['grp-util'] : true
			}
		};

		res.json(response);
	})
// return status of all commands in given group
	.get('/info/guild/:guildId/commands/:groupName', checkAuth, async (req, res) => {
		const { guildId } = req.params;
		const groupCommands = commandMap[req.params.groupName];
		const currentGuildDoc = await GuildSettings.findOne({ guild: guildId });
		const settings = JSON.parse(currentGuildDoc.settings);
		const response = {};

		groupCommands.map(commandName => {
			response[commandName] = settings[`cmd-${commandName}`] ? settings[`cmd-${commandName}`] : true;
		});

		res.json(response);
	})
// return status of a given feature
	.get('/info/guild/:guildId/feature/:featureName', checkAuth, async (req, res) => {
		const { guildId } = req.params;
		const currentGuildDoc = await GuildSettings.findOne({ guild: guildId });
		const settings = JSON.parse(currentGuildDoc.settings);
		let response = {};

		switch (req.params.featureName) {
			case ('starboard'): {
				response = {
					feature: 'starboard',
					enabled: settings.starboardEnabled ? settings.starboardEnabled : false,
					channel: settings.starboardChannel ? settings.starboardChannel : null,
					trigger: settings.starboardTrigger ? settings.starboardTrigger : '⭐'
				};
				break;
			}
			case ('welcome'): {
				response = {
					feature: 'welcome',
					enabled: settings.welcomeEnabled ? settings.welcomeEnabled : false,
					channel: settings.welcomeChannel ? settings.welcomeChannel : null,
					message: settings.welcomeMessage ? settings.welcomeMessage : '@here, please Welcome {user} to {guild}!'
				};
				break;
			}
			case ('goodbye'): {
				response = {
					feature: 'goodbye',
					enabled: settings.goodbyeEnabled ? settings.goodbyeEnabled : false,
					channel: settings.goodbyeChannel ? settings.goodbyeChannel : null,
					message: settings.goodbyeMessage ? settings.goodbyeMessage : '{user} has left the server.'
				};
				break;
			}
			case ('tos'): {
				response = {
					feature: 'tos',
					defaultRoles: settings.defaultRoles ? settings.defaultRoles : [],
					channel: settings.tosChannel ? settings.tosChannel : null,
					messageCount: settings.tosMessageCount ? settings.tosMessageCount : 0
				};
				// retrieve tosMessages
				break;
			}
			case ('roles'): {
				response = {
					feature: 'roles',
					assignableRoles: settings.assignableRoles ? settings.assignableRoles : []
				};
				break;
			}
		}

		res.json(response);
	});
// toggle command group enabled/disabled

// toggle command

function checkAuth(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.status(403).send({
			errorMessage: 'You must be logged in.'
		});
	}
}
