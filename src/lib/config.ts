import { Client } from 'klasa';

/**
 * The following are all client options for Klasa/Discord.js.
 * Any option that you wish to use the default value can be removed from this file.
 * This file is init with defaults from both Klasa and Discord.js.
 */

exports.config = {
	/**
	 * General Options
	 */
	// Whether d.js should queue your rest request in 'sequential' or 'burst' mode
	apiRequestMethod: 'sequential',
	// Any Websocket Events you don't want to listen to
	disabledEvents: [
		'GUILD_INTEGRATIONS_UPDATE',
		'GUILD_BAN_ADD',
		'GUILD_BAN_REMOVE',
		'GUILD_EMOJIS_UPDATE',
		'CHANNEL_PINS_UPDATE',
		'MESSAGE_DELETE',
		'MESSAGE_DELETE_BULK',
		'MESSAGE_REACTION_ADD',
		'MESSAGE_REACTION_REMOVE',
		'MESSAGE_REACTION_REMOVE_ALL',
		'PRESENCE_UPDATE',
		'VOICE_STATE_UPDATE',
		'TYPING_START',
		'VOICE_STATE_UPDATE',
		'VOICE_SERVER_UPDATE',
		'WEBHOOKS_UPDATE'
	],
	// If your bot should be able to mention @everyone
	disableEveryone: false,
	// The default language that comes with klasa. More base languages can be found on Klasa-Pieces
	language: 'en-US',
	// The default configurable prefix for each guild
	prefix: '!',
	// A presence to login with
	presence: {},
	// If custom settings should be preserved when a guild removes your bot
	preserveSettings: true,
	// Disables/Enables a process.on('unhandledRejection'...) handler
	production: false,
	// A once ready message for your console
	readyMessage: (client: Client) => `Successfully initialized. Ready to serve ${client.guilds.size} guild${client.guilds.size === 1 ? '' : 's'}.`,
	// The time in ms to add to ratelimits, to ensure you wont hit a 429 response
	restTimeOffset: 500,

	/**
	 * Caching Options
	 */
	commandMessageLifetime: 1800,
	fetchAllMembers: false,
	messageCacheLifetime: 30,
	messageCacheMaxSize: 0,
	// The above 2 options are ignored while the interval is 0
	messageSweepInterval: 60,

	/**
	 * Sharding Options
	 */
	/* tslint:disable */
	// shardCount: 0,
	// shardId: 0,
	/* tslint:enable */

	/**
	 * Command Handler Options
	 */
	commandEditing: true,
	commandLogging: true,
	typing: true,

	/**
	 * Database Options
	 */
	providers: {
		/*
		// Provider Connection object for process based databases:
		// rethinkdb, mongodb, mssql, mysql, postgresql
		mysql: {
			host: 'localhost',
			db: 'klasa',
			user: 'database-user',
			password: 'database-password',
			options: {}
		},
		*/
		default: 'mongodb',
		mongodb: {
			db: 'spud-dev-nate',
			host: 'ds018248.mlab.com',
			password: '8Uyl7CEEZjoj',
			port: '18248',
			user: 'spud-dev'
		}
	},

	/**
	 * Custom Prompt Defaults
	 */
	customPromptDefaults: {
		limit: Infinity,
		quotedStringSupport: false,
		time: 30000
	},

	/**
	 * Klasa Piece Defaults
	 */
	pieceDefaults: {
		commands: {
			aliases: [],
			autoAliases: true,
			bucket: 2,
			cooldown: 3,
			deletable: true,
			description: '',
			enabled: true,
			guarded: false,
			nsfw: false,
			permissionLevel: 0,
			promptLimit: 0,
			promptTime: 30000,
			quotedStringSupport: true,
			requiredPermissions: 0,
			requiredSettings: [],
			runIn: ['text'],
			subcommands: false,
			usage: ''
		},
		events: {
			enabled: true,
			once: false
		},
		extendables: {
			appliesTo: [],
			enabled: true,
			klasa: false
		},
		finalizers: { enabled: true },
		inhibitors: {
			enabled: true,
			spamProtection: false
		},
		languages: { enabled: true },
		monitors: {
			enabled: true,
			ignoreBots: true,
			ignoreEdits: true,
			ignoreOthers: true,
			ignoreSelf: true,
			ignoreWebhooks: true
		},
		providers: {
			cache: false,
			enabled: true,
			mongodb: true,
			sql: false
		},
		tasks: { enabled: true }
	},

	/**
	 * Console Event Handlers (enabled/disabled)
	 */
	consoleEvents: {
		debug: process.env.spud_debug ? !!process.env.spud_debug : false,
		error: true,
		log: true,
		verbose: false,
		warn: true,
		wtf: true
	},

	/**
	 * Console Options
	 */
	console: {
		// Alternatively a Moment Timestamp string can be provided to customize the timestamps.
		colors: {
			debug: { time: { background: 'magenta' } },
			error: { time: { background: 'red' } },
			log: { time: { background: 'blue' } },
			verbose: { time: { text: 'gray' } },
			warn: { time: { background: 'lightyellow', text: 'black' } },
			wtf: { message: { text: 'red' }, time: { background: 'red' } }
		},
		timestamps: true,
		utc: false
	},

	/**
	 * Custom Setting Gateway Options
	 */
	gateways: {
		clientStorage: {},
		guilds: {},
		users: {}
	},

	/**
	 * Klasa Schedule Options
	 */
	schedule: { interval: 60000 }
};

// The token for this bot to login with
exports.token = process.env.spud_token;
