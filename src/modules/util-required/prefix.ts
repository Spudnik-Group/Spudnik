import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { stripIndents } from 'common-tags';
import { startTyping, stopTyping, sendSimpleEmbeddedError } from '../../lib/helpers';
import { getEmbedColor, deleteCommandMessages, modLogMessage } from '../../lib/custom-helpers';

/**
 * Returns or sets the command prefix.
 *
 * @export
 * @class PrefixCommand
 * @extends {Command}
 */
export default class PrefixCommand extends Command {
	/**
	 * Creates an instance of PrefixCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof PrefixCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					default: '',
					key: 'prefix',
					max: 15,
					prompt: 'What would you like to set the bot\'s prefix to?',
					type: 'string'
				}
			],
			description: 'Returns or sets the command prefix.',
			details: stripIndents`
				syntax: \`!prefix (prefix|none|default)\`

				If no prefix is provided, the current prefix will be shown.
				If the prefix is "default", the prefix will be reset to the bot's default prefix.
				If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands.

				ADMINISTRATOR permission required (to change the prefix).
			`,
			examples: ['!prefix', '!prefix -', '!prefix omg!', '!prefix default', '!prefix none'],
			format: '[prefix/"default"/"none"]',
			group: 'util-required',
			guarded: true,
			guildOnly: true,
			memberName: 'prefix',
			name: 'prefix'
		});
	}

	/**
	 * Run the "Prefix" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ prefix: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof PrefixCommand
	 */
	public async run(msg: CommandoMessage, args: { prefix: string }): Promise<Message | Message[]> {
		const prefixEmbed: MessageEmbed = new MessageEmbed({
			author: {
				iconURL: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/memo_1f4dd.png',
				name: 'Prefix'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		startTyping(msg);
		
		// Just output the prefix
		if(!args.prefix) {
			const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
			prefixEmbed.setDescription(stripIndents`
				${prefix ? `The command prefix is \`\`${prefix}\`\`.` : 'There is no command prefix.'}
				To run commands, use ${msg.anyUsage('command')}.
			`);
			stopTyping(msg);
			
			return msg.embed(prefixEmbed);
		}

		// Check the user's permission before changing anything
		if(msg.guild) {
			if(!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
				stopTyping(msg);

				return sendSimpleEmbeddedError(msg, 'Only administrators may change the command prefix.', 3000);
			}
		} else if(!this.client.isOwner(msg.author)) {
			stopTyping(msg);

			return sendSimpleEmbeddedError(msg, 'Only the bot owner(s) may change the global command prefix.', 3000);
		}

		// Save the prefix
		const lowercase = args.prefix.toLowerCase();
		const prefix = lowercase === 'none' ? '' : args.prefix;
		let response;
		if(lowercase === 'default') {
			if(msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null;

			const current = this.client.commandPrefix ? `\`\`${this.client.commandPrefix}\`\`` : 'no prefix';

			response = `Reset the command prefix to the default (currently ${current}).`;
		} else {
			if(msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix;

			response = prefix ? `Set the command prefix to \`\`${args.prefix}\`\`.` : 'Removed the command prefix entirely.';
		}

		prefixEmbed.setDescription(stripIndents`
			${response} To run commands, use ${msg.anyUsage('command')}.
		`);
		deleteCommandMessages(msg);
		modLogMessage(msg, prefixEmbed);
		stopTyping(msg);

		return msg.embed(prefixEmbed);
	}
}
