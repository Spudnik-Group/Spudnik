/**
 * Copyright (c) 2020 Spudnik Group
 */

export const SpudConfig = {
	'token': process.env.spud_token,
	'port': process.env.spud_port,
	'owner': process.env.spud_owner,
	'spudCoreDB': process.env.SPUD_CORE_DB || process.env.spud_mongo,
	'spudStatsDB': process.env.SPUD_STATS_DB || process.env.spud_mongo,
	'botListGuilds': process.env.spud_botlist_guilds ? process.env.spud_botlist_guilds.split(',') : [],
	'botListUpdateInterval': process.env.spud_botlist_update_interval ? +process.env.spud_botlist_update_interval : 600000,
	'statusUpdateInterval': process.env.spud_status_update_interval ? +process.env.spud_status_update_interval : 600000,
	'debug': process.env.spud_debug ? !!process.env.spud_debug : false,
	'rollbarApiKey': process.env.spud_rollbarapi || '',
	'issueLogChannel': process.env.spud_issuelog || '',
	// Command-Specific API Keys
	'wolframApiKey': process.env.spud_wolframapi || '',
	'tmdbAPIkey': process.env.spud_moviedbapi || '',
	'dictionaryApiKey': process.env.spud_dictionaryapi || '',
	'breweryDbApiKey': process.env.spud_brewdbapi || '',
	'trackerApiKey': process.env.spud_trackerapi || '',
	'stackoverflowApiKey': process.env.spud_stackoverflowapi || '',
	// Bot List API Keys
	'bfdApiKey': process.env.spud_bfdapi || '',
	'bodApiKey': process.env.spud_bodapi || '',
	'botsggApiKey': process.env.spud_botsggapi || '',
	'dbApiKey': process.env.spud_dbapi || '',
	'dblApiKey': process.env.spud_dblapi || '',
}
