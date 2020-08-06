/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Client, Colors, KlasaClientOptions } from 'klasa';
import { SpudConfig } from './spud-config';
import { permissionLevels } from '@lib/schemas/permission-levels';

export const KlasaConfig: KlasaClientOptions = {
	/**
	 * General Options
	 */
	disabledEvents: [
		'GUILD_INTEGRATIONS_UPDATE',
		'GUILD_BAN_ADD',
		'GUILD_BAN_REMOVE',
		'GUILD_EMOJIS_UPDATE',
		'CHANNEL_PINS_UPDATE',
		'PRESENCE_UPDATE',
		'VOICE_STATE_UPDATE',
		'TYPING_START',
		'VOICE_STATE_UPDATE',
		'VOICE_SERVER_UPDATE',
		'WEBHOOKS_UPDATE'
	],
	disabledCorePieces: [
		'commands',
		'providers'
	],
	owners: SpudConfig.owners,
	disableEveryone: false,
	prefix: '!',
	production: (process.env.NODE_ENV === 'production'),
	readyMessage: (client: Client) => new Colors({ text: 'magenta' }).format(`Logged into Discord! Serving in ${client.guilds.array().length} Discord servers`),
	restTimeOffset: 500,

	/**
	 * Settings Options
	 */
	settings: {
		preserve: false
	},

	/**
	 * Command Handler Options
	 */
	commandLogging: true,
	typing: true,

	/**
	 * Database Options
	 */
	providers: {
		'default': 'mongodb',
		'mongodb': {
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
	// Gateways: {
	// ClientStorage: {},
	// Guilds: {},
	// Users: {}
	// },

	/**
	 * Klasa Schedule Options
	 */
	schedule: { interval: 60000 }
};
