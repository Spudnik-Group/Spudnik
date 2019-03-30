import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { stripIndents, oneLine } from 'common-tags';
import { disambiguation } from '../../lib/helpers';

/**
 * Returns a list of available commands, or detailed information for a specific command.
 *
 * @export
 * @class HelpCommand
 * @extends {Command}
 */
export default class HelpCommand extends Command {
	/**
	 * Creates an instance of HelpCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof HelpCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['commands'],
			args: [
				{
					default: '',
					key: 'command',
					prompt: 'Which command would you like to view the help for?',
					type: 'string'
				}
			],
			description: 'Used to return a list of available commands, or detailed information for a specified command.',
			details: stripIndents`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
			examples: ['!help', '!help prefix'],
			group: 'util-required',
			guarded: true,
			guildOnly: true,
			memberName: 'help',
			name: 'help'
		});
	}

	/**
	 * Run the "Help" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof HelpCommand
	 */
	public async run(msg: CommandoMessage, args: { command: string }): Promise<Message | Message[]> {
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				let help = stripIndents`
					${oneLine`
						__Command **${commands[0].name}**:__ ${commands[0].description}
						${commands[0].guildOnly ? ' (Usable only in servers)' : ''}
						${commands[0].nsfw ? ' (NSFW)' : ''}
					`}

					**Format:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
				`;
				if(commands[0].aliases.length > 0) help += `\n**Aliases:** ${commands[0].aliases.join(', ')}`;
				help += `\n${oneLine`
					**Group:** ${commands[0].group.name}
					(\`${commands[0].groupID}:${commands[0].memberName}\`)
				`}`;
				if(commands[0].details) help += `\n**Details:** ${commands[0].details}`;
				if(commands[0].examples) help += `\n**Examples:**\n${commands[0].examples.join('\n')}`;

				try {
					await msg.direct(help);
					if(msg.channel.type !== 'dm') return msg.reply('Sent you a DM with information.');
				} catch(err) {
					return msg.reply('Unable to send you the help DM. You probably have DMs disabled.');
				}
			} else if(commands.length > 15) {
				return msg.reply('Multiple commands found. Please be more specific.');
			} else if(commands.length > 1) {
				return msg.reply(disambiguation(commands, 'commands'));
			} else {
				return msg.reply(
					`Unable to identify command. Use ${msg.usage(
						null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} to view the list of all commands.`
				);
			}
		} else {
			try {
				await msg.direct(stripIndents`
					${oneLine`
						To run a command in ${msg.guild ? msg.guild.name : 'any server'},
						use ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
						For example, ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
					`}
					To run a command in this DM, simply use ${Command.usage('command', null, null)} with no prefix.

					Use ${this.usage('<command>', null, null)} to view detailed information about a specific command.
					Use ${this.usage('all', null, null)} to view a list of *all* commands, not just available ones.

					__**${showAll ? 'All commands' : `Available commands in ${msg.guild || 'this DM'}`}**__

					${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg.message))))
						.map(grp => stripIndents`
							__${grp.name}__
							${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg.message)))
								.map(cmd => `**${cmd.name}:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
							}
						`).join('\n\n')
					}
				`, { split: true });
				if(msg.channel.type !== 'dm') return msg.reply('Sent you a DM with information.');
			} catch(err) {
				return msg.reply('Unable to send you the help DM. You probably have DMs disabled.');
			}
		}
	}
}
