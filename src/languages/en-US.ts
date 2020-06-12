import { Language, util, Duration } from 'klasa';
import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { LanguageKeys } from '@lib/types/Language';

/* eslint-disable */

const PERMS = {
	ADMINISTRATOR: 'Administrator',
	VIEW_AUDIT_LOG: 'View Audit Log',
	MANAGE_GUILD: 'Manage Server',
	MANAGE_ROLES: 'Manage Roles',
	MANAGE_CHANNELS: 'Manage Channels',
	KICK_MEMBERS: 'Kick Members',
	BAN_MEMBERS: 'Ban Members',
	CREATE_INSTANT_INVITE: 'Create Instant Invite',
	CHANGE_NICKNAME: 'Change Nickname',
	MANAGE_NICKNAMES: 'Manage Nicknames',
	MANAGE_EMOJIS: 'Manage Emojis',
	MANAGE_WEBHOOKS: 'Manage Webhooks',
	VIEW_CHANNEL: 'Read Messages',
	SEND_MESSAGES: 'Send Messages',
	SEND_TTS_MESSAGES: 'Send TTS Messages',
	MANAGE_MESSAGES: 'Manage Messages',
	EMBED_LINKS: 'Embed Links',
	ATTACH_FILES: 'Attach Files',
	READ_MESSAGE_HISTORY: 'Read Message History',
	MENTION_EVERYONE: 'Mention Everyone',
	USE_EXTERNAL_EMOJIS: 'Use External Emojis',
	ADD_REACTIONS: 'Add Reactions',
	CONNECT: 'Connect',
	SPEAK: 'Speak',
	STREAM: 'Stream',
	MUTE_MEMBERS: 'Mute Members',
	DEAFEN_MEMBERS: 'Deafen Members',
	MOVE_MEMBERS: 'Move Members',
	USE_VAD: 'Use Voice Activity',
	PRIORITY_SPEAKER: 'Priority Speaker'
};

/** Parses cardinal numbers to the ordinal counterparts */
function ordinal(cardinal: number) {
	const cent = cardinal % 100;
	const dec = cardinal % 10;

	if (cent >= 10 && cent <= 20) {
		return `${cardinal}th`;
	}

	switch (dec) {
		case 1:
			return `${cardinal}st`;
		case 2:
			return `${cardinal}nd`;
		case 3:
			return `${cardinal}rd`;
		default:
			return `${cardinal}th`;
	}
}

export default class extends Language {

	public PERMISSIONS = PERMS;
	public HUMAN_LEVELS = {
		0: 'None',
		1: 'Low',
		2: 'Medium',
		3: '(╯°□°）╯︵ ┻━┻',
		4: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
	};

	public ordinal = ordinal;

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore:2416
	public language: LanguageKeys = {
		DEFAULT: key => `${key} has not been localized for en-US yet.`,
		DEFAULT_LANGUAGE: 'Default Language',
		PREFIX_REMINDER: (prefix = `@${this.client.user.tag}`) => `The prefix${Array.isArray(prefix)
			? `es for this guild are: ${prefix.map(pre => `\`${pre}\``).join(', ')}`
			: ` in this guild is set to: \`${prefix}\``
		}`,
		
		SETTING_GATEWAY_EXPECTS_GUILD: 'The parameter <Guild> expects either a Guild or a Guild Object.',
		SETTING_GATEWAY_VALUE_FOR_KEY_NOEXT: (data, key) => `The value ${data} for the key ${key} does not exist.`,
		SETTING_GATEWAY_VALUE_FOR_KEY_ALREXT: (data, key) => `The value ${data} for the key ${key} already exists.`,
		SETTING_GATEWAY_SPECIFY_VALUE: 'You must specify the value to add or filter.',
		SETTING_GATEWAY_KEY_NOT_ARRAY: key => `The key ${key} is not an Array.`,
		SETTING_GATEWAY_KEY_NOEXT: key => `The key ${key} does not exist in the current data schema.`,
		SETTING_GATEWAY_INVALID_TYPE: 'The type parameter must be either add or remove.',
		SETTING_GATEWAY_INVALID_FILTERED_VALUE: (piece, value) => `${piece.key} doesn't accept the value: ${value}`,
		
		RESOLVER_MULTI_TOO_FEW: (name, min = 1) => `Provided too few ${name}s. At least ${min} ${min === 1 ? 'is' : 'are'} required.`,
		RESOLVER_INVALID_BATTLETAG: name => `${name} must be a valid battletag in the format: \`username#0000\``,
		RESOLVER_INVALID_BOOL: name => `${name} must be true or false.`,
		RESOLVER_INVALID_CHANNEL: name => `${name} must be a channel tag or valid channel id.`,
		RESOLVER_INVALID_CUSTOM: (name, type) => `${name} must be a valid ${type}.`,
		RESOLVER_INVALID_DATE: name => `${name} must be a valid date.`,
		RESOLVER_INVALID_DURATION: name => `${name} must be a valid duration string.`,
		RESOLVER_INVALID_EMOJI: name => `${name} must be a custom emoji tag or valid emoji id.`,
		RESOLVER_INVALID_FLOAT: name => `${name} must be a valid number.`,
		RESOLVER_INVALID_GUILD: name => `${name} must be a valid guild id.`,
		RESOLVER_INVALID_HEXCOLOR: name => `${name} must be a valid hex color.`,
		RESOLVER_INVALID_INT: name => `${name} must be an integer.`,
		RESOLVER_INVALID_LITERAL: name => `Your option did not match the only possibility: ${name}`,
		RESOLVER_INVALID_MEMBER: name => `${name} must be a mention or valid user id.`,
		RESOLVER_INVALID_MESSAGE: name => `${name} must be a valid message id.`,
		RESOLVER_INVALID_PIECE: (name, piece) => `${name} must be a valid ${piece} name.`,
		RESOLVER_INVALID_REGEX_MATCH: (name, pattern) => `${name} must follow this regex pattern \`${pattern}\`.`,
		RESOLVER_INVALID_ROLE: name => `${name} must be a role mention or role id.`,
		RESOLVER_INVALID_STRING: name => `${name} must be a valid string.`,
		RESOLVER_INVALID_TIME: name => `${name} must be a valid duration or date string.`,
		RESOLVER_INVALID_URL: name => `${name} must be a valid url.`,
		RESOLVER_INVALID_USER: name => `${name} must be a mention or valid user id.`,
		RESOLVER_STRING_SUFFIX: ' characters',
		RESOLVER_MINMAX_EXACTLY: (name, min, suffix) => `${name} must be exactly ${min}${suffix}.`,
		RESOLVER_MINMAX_BOTH: (name, min, max, suffix) => `${name} must be between ${min} and ${max}${suffix}.`,
		RESOLVER_MINMAX_MIN: (name, min, suffix) => `${name} must be greater than ${min}${suffix}.`,
		RESOLVER_MINMAX_MAX: (name, max, suffix) => `${name} must be less than ${max}${suffix}.`,
		
		REACTIONHANDLER_PROMPT: 'Which page would you like to jump to?',
		
		COMMANDMESSAGE_MISSING: 'Missing one or more required arguments after end of input.',
		COMMANDMESSAGE_MISSING_REQUIRED: name => `${name} is a required argument.`,
		COMMANDMESSAGE_MISSING_OPTIONALS: possibles => `Missing a required option: (${possibles})`,
		COMMANDMESSAGE_NOMATCH: possibles => `Your option didn't match any of the possibilities: (${possibles})`,
		
		// eslint-disable-next-line max-len
		MONITOR_COMMAND_HANDLER_REPROMPT: (tag, error, time, abortOptions) => `${tag} | **${error}** | You have **${time}** seconds to respond to this prompt with a valid argument. Type **${abortOptions.join('**, **')}** to abort this prompt.`,
		// eslint-disable-next-line max-len
		MONITOR_COMMAND_HANDLER_REPEATING_REPROMPT: (tag, name, time, cancelOptions) => `${tag} | **${name}** is a repeating argument | You have **${time}** seconds to respond to this prompt with additional valid arguments. Type **${cancelOptions.join('**, **')}** to cancel this prompt.`,
		MONITOR_COMMAND_HANDLER_ABORTED: 'Aborted',
		
		INHIBITOR_COOLDOWN: remaining => `You have just used this command. You can use this command again in ${remaining} second${remaining === 1 ? '' : 's'}.`,
		INHIBITOR_DISABLED_GUILD: 'This command has been disabled by an admin in this guild.',
		INHIBITOR_DISABLED_GLOBAL: 'This command has been globally disabled by the bot owner.',
		INHIBITOR_MISSING_BOT_PERMS: missing => `Insufficient permissions, missing: **${missing}**`,
		INHIBITOR_NSFW: 'You can only use NSFW commands in NSFW channels.',
		INHIBITOR_PERMISSIONS: 'You do not have permission to use this command.',
		INHIBITOR_REQUIRED_SETTINGS: settings => `The guild is missing the **${settings.join(', ')}** guild setting${settings.length === 1 ? '' : 's'} and thus the command cannot run.`,
		INHIBITOR_RUNIN: types => `This command is only available in ${types} channels.`,
		INHIBITOR_RUNIN_NONE: name => `The ${name} command is not configured to run in any channel.`,
		
		COMMAND_BLACKLIST_DESCRIPTION: 'Blacklists or un-blacklists users and guilds from the bot.',
		COMMAND_BLACKLIST_SUCCESS: (usersAdded, usersRemoved, guildsAdded, guildsRemoved) => [
			usersAdded.length ? `**Users Added**\n${util.codeBlock('', usersAdded.join(', '))}` : '',
			usersRemoved.length ? `**Users Removed**\n${util.codeBlock('', usersRemoved.join(', '))}` : '',
			guildsAdded.length ? `**Guilds Added**\n${util.codeBlock('', guildsAdded.join(', '))}` : '',
			guildsRemoved.length ? `**Guilds Removed**\n${util.codeBlock('', guildsRemoved.join(', '))}` : ''
		].filter(val => val !== '').join('\n'),
		COMMAND_HELP_DESCRIPTION: 'Display help for a command.',
		COMMAND_HELP_NO_EXTENDED: 'No extended help available.',
		COMMAND_HELP_USAGE: usage => `Usage :: ${usage}`,
		COMMAND_HELP_EXTENDED: 'Extended Help ::',
		COMMAND_CONF_NOKEY: 'You must provide a key',
		COMMAND_CONF_NOVALUE: 'You must provide a value',
		COMMAND_CONF_GUARDED: name => `${util.toTitleCase(name)} may not be disabled.`,
		COMMAND_CONF_UPDATED: (key, response) => `Successfully updated the key **${key}**: \`${response}\``,
		COMMAND_CONF_KEY_NOT_ARRAY: 'This key is not array type. Use the action \'reset\' instead.',
		COMMAND_CONF_GET_NOEXT: key => `The key **${key}** does not seem to exist.`,
		COMMAND_CONF_GET: (key, value) => `The value for the key **${key}** is: \`${value}\``,
		COMMAND_CONF_RESET: (key, response) => `The key **${key}** has been reset to: \`${response}\``,
		COMMAND_CONF_NOCHANGE: key => `The value for **${key}** was already that value.`,
		COMMAND_CONF_SERVER_DESCRIPTION: 'Define per-guild settings.',
		COMMAND_CONF_SERVER: (key, list) => `**Guild Settings${key}**\n${list}`,
		COMMAND_CONF_USER_DESCRIPTION: 'Define per-user settings.',
		COMMAND_CONF_USER: (key, list) => `**User Settings${key}**\n${list}`,
		COMMAND_STATS: (color, stats, uptime, usage) => new MessageEmbed()
			.setColor(color)
			.setDescription('**Spudnik Statistics**')
			.addField('❯ Uptime', Duration.toNow(Date.now() - (uptime.CLIENT / 1000)), true)
			.addField('❯ Process Stats', stripIndents`
						• Memory Usage: ${usage.RAM_USED}
						• Node Version: ${stats.NODE_JS}
						• Version: ${stats.VERSION}`, true)
			.addField('❯ General Stats', stripIndents`
						• Guilds: ${stats.GUILDS}
						• Channels: ${stats.CHANNELS}
						• Users: ${stats.USERS}
						• Commands: ${this.client.commands.size}`, true)
			.addField('❯ Spudnik Command', '[Join](https://spudnik.io/support)', true)
			.addField('❯ Source Code', '[View](https://github.com/Spudnik-Group/Spudnik)', true)
			.addField('❯ Invite to Your Server!', '[Invite](https://spudnik.io/invite)', true),
		COMMAND_STATS_DESCRIPTION: 'Provides some details about the bot and stats.',
		
		MESSAGE_PROMPT_TIMEOUT: 'The prompt has timed out.',
		TEXT_PROMPT_ABORT_OPTIONS: ['abort', 'stop', 'cancel'],

		STARBOARD_AUTHOR: 'Author',
		STARBOARD_CHANNEL: 'Channel',
		STARBOARD_JUMP: 'Jump',
		STARBOARD_LINK: 'Link',
		STARBOARD_MESSAGE: 'Message'
	};

	public async init() {
		// noop
	}

}
