/**
 * Copyright (c) 2020 Spudnik Group
 */

// Tslint:disable
export const SpudConfig = {
	token: process.env.SPUD_TOKEN,
	port: process.env.PORT || 1337,
	owners: process.env.SPUD_OWNERS ? process.env.SPUD_OWNERS.split(',') : [],
	spudCoreDB: process.env.SPUD_CORE_DB,
	spudCoreDBConnection: process.env.SPUD_CORE_DB_CONNECTION,
	spudStatsDB: process.env.SPUD_STATS_DB,
	spudStatsDBConnection: process.env.SPUD_STATS_DB_CONNECTION,
	botListGuilds: process.env.SPUD_BOTLIST_GUILDS ? process.env.SPUD_BOTLIST_GUILDS.split(',') : [],
	botListUpdateInterval: process.env.SPUD_BOTLIST_UPDATE_INTERVAL || '0 10,22 * * *',
	statusUpdateInterval: process.env.SPUD_STATUS_UPDATE_INTERVAL || '* * * * *',
	debug: process.env.SPUD_DEBUG ? Boolean(process.env.SPUD_DEBUG) : false,
	rollbarApiKey: process.env.SPUD_ROLLBARAPI || '',
	issueLogChannel: process.env.SPUD_ISSUELOG || '',
	botOwnerLogChannel: process.env.SPUD_OWNERLOG || '',
	// Command-Specific API Keys
	wolframApiKey: process.env.SPUD_WOLFRAMAPI || '',
	tmdbAPIkey: process.env.SPUD_MOVIEDBAPI || '',
	dictionaryApiKey: process.env.SPUD_DICTIONARYAPI || '',
	breweryDbApiKey: process.env.SPUD_BREWDBAPI || '',
	stackoverflowApiKey: process.env.SPUD_STACKOVERFLOWAPI || '',
	// BotBlock API Keys
	arcanecenterApiKey: process.env.SPUD_ARCANEAPI || '',
	botlistspaceApiKey: process.env.SPUD_BOTSPACEAPI || '',
	bodApiKey: process.env.SPUD_BODAPI || '',
	bfdApiKey: process.env.SPUD_BFDAPI || '',
	discordboatsApiKey: process.env.SPUD_DBOATSAPI || '',
	botsggApiKey: process.env.SPUD_BOTSGGAPI || '',
	discordappsApiKey: process.env.SPUD_DAPPSAPI || '',
	dblApiKey: process.env.SPUD_DBLAPI || '',
	delApiKey: process.env.SPUD_DELAPI || '',
	glennApiKey: process.env.SPUD_GLENNAPI || '',
	mythicalApiKey: process.env.SPUD_MYTHICALAPI || '',
	topggApiKey: process.env.SPUD_TOPGGAPI || '',
	yablApiKey: process.env.SPUD_YABLAPI || '',
	// Non-BotBlock API Keys
	cloudlistApi: process.env.SPUD_CLOUDLISTAPI || '',
	lbotsApi: process.env.SPUD_LBOTSAPI || '',
	lmbApi: process.env.SPUD_LMBAPI || '',
	dbwApi: process.env.SPUD_DBWAPI || ''
};
