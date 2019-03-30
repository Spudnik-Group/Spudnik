import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { stripIndents } from 'common-tags';

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

				ADMINISTRATOR permission required.
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
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof PrefixCommand
	 */
	public async run(msg: CommandoMessage, args: { prefix: string }): Promise<Message | Message[]> {
		// Just output the prefix
		if(!args.prefix) {
			const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
			return msg.reply(stripIndents`
				${prefix ? `The command prefix is \`\`${prefix}\`\`.` : 'There is no command prefix.'}
				To run commands, use ${msg.anyUsage('command')}.
			`);
		}

		// Check the user's permission before changing anything
		if(msg.guild) {
			if(!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
				return msg.reply('Only administrators may change the command prefix.');
			}
		} else if(!this.client.isOwner(msg.author)) {
			return msg.reply('Only the bot owner(s) may change the global command prefix.');
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

		await msg.reply(`${response} To run commands, use ${msg.anyUsage('command')}.`);
		return null;
	}
}
