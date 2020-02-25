/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Client, KlasaClientOptions } from 'klasa';
import { SpudConfig } from './spud-config';
import { permissionLevels } from '@lib/schemas/permission-levels';

/**
 * The following are all client options for Klasa/Discord.js.
 * Any option that you wish to use the default value can be removed from this file.
 * This file is init with defaults from both Klasa and Discord.js.
 */

// tslint:disable
export const KlasaConfig: KlasaClientOptions = {
	/**
	 * General Options
	 */
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
	disabledCorePieces: [
		'commands',
		// 'providers'
	],
	// If your bot should be able to mention @everyone
	disableEveryone: false,
	// The default language that comes with klasa. More base languages can be found on Klasa-Pieces
	language: 'en-US',
	// The default configurable prefix for each guild
	prefix: '!',
	// A presence to login with
	presence: {},
	// Disables/Enables a process.on('unhandledRejection'...) handler
	production: !!SpudConfig.debug,
	// A once ready message for your console
	readyMessage: (client: Client) => `Successfully initialized. Ready to serve ${client.guilds.size} guild${client.guilds.size === 1 ? '' : 's'}.`,
	// The time in ms to add to ratelimits, to ensure you wont hit a 429 response
	restTimeOffset: 500,

	/**
	 * Caching Options
	 */
	commandMessageLifetime: 1800,
	fetchAllMembers: false,
	messageCacheLifetime: 900,
	messageCacheMaxSize: 300,
	// The above 2 options are ignored while the interval is 0
	messageSweepInterval: 60,

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
		// Provider Connection object for process based databases:
		// rethinkdb, mongodb, mssql, mysql, postgresql
		// default: 'json',
		default: 'mongodb',
		mongodb: {
			db: SpudConfig.spudCoreDB,
			connectionString: SpudConfig.spudCoreDBConnection
		}
	},

	/**
	 * Custom Prompt Defaults
	 */
	customPromptDefaults: {
		limit: Infinity,
		quotedStringSupport: true,
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
			promptLimit: 0,
			promptTime: 30000,
			quotedStringSupport: true,
			runIn: ['text'],
			subcommands: false,
			usage: '',
			usageDelim: ' '
		},
		events: {
			enabled: true,
			once: false
		},
		extendables: {
			appliesTo: [],
			enabled: true
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
			ignoreSelf: true,
			ignoreWebhooks: true
		},
		providers: {
			enabled: true
		}
	},
	permissionLevels,

	/**
	 * Console Event Handlers (enabled/disabled)
	 */
	consoleEvents: {
		debug: SpudConfig.debug,
		error: true,
		log: true,
		verbose: SpudConfig.debug,
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
	// gateways: {
	// 	clientStorage: {},
	// 	guilds: {},
	// 	users: {}
	// },

	/**
	 * Klasa Schedule Options
	 */
	schedule: { interval: 60000 }
};
// tslint:enable
