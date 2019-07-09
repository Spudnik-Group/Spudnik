import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { stripIndents } from 'common-tags';
import { disambiguation, sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Returns helpful information on the bot, or detailed information for a specific command.
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
			args: [
				{
					default: '',
					key: 'command',
					prompt: 'Which command would you like to view the help for?',
					type: 'string'
				}
			],
			description: 'Used to return helpful information on the bot, or detailed information for a specified command.',
			examples: ['!help', '!help prefix'],
			group: 'help',
			guarded: true,
			memberName: 'help',
			name: 'help'
		});
	}

	/**
	 * Run the "Help" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ command: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof HelpCommand
	 */
	public async run(msg: CommandoMessage, args: { command: string }): Promise<Message | Message[]> {
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const helpEmbed: MessageEmbed = new MessageEmbed()
			.setColor(getEmbedColor(msg));
		if(args.command) {
			if (commands.length === 1) {
				helpEmbed
					.setTitle(`__Command: **${commands[0].name}**__`)
					.addField('❯ Description', commands[0].description)
					.addField('❯ Usage', msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`))
					.addField('❯ Details', commands[0].details ? commands[0].details : 'None')
					.addField('❯ Aliases', commands[0].aliases.length > 0 ? commands[0].aliases.join(', ') : 'None', true)
					.addField('❯ Group', `${commands[0].group.name} (\`${commands[0].groupID}:${commands[0].memberName}\`)`, true)
					.addField('❯ Examples', commands[0].examples.join('\n'), true)
					.addField('❯ BOT Permissions', commands[0].clientPermissions ? commands[0].clientPermissions.join('\n') : 'No extra perms required', true)
					.addField('❯ User Permissions', commands[0].userPermissions ? commands[0].userPermissions.join('\n') : 'No extra perms required', true)
					.addField('❯ Other Details', stripIndents`
						Guild Only: ${commands[0].guildOnly ? '**Yes**' : '**No**'}
						NSFW Only: ${commands[0].nsfw ? '**Yes**' : '**No**'}
						Enabled: ${commands[0].isEnabledIn(msg.guild) ? '**Yes**' : '**No**'}
					`, true);
				
				deleteCommandMessages(msg);
				
				return msg.embed(helpEmbed);
			} else if(commands.length > 15) {
				return sendSimpleEmbeddedMessage(msg, 'Multiple commands found. Please be more specific.', 3000);
			} else if(commands.length > 1) {
				return msg.reply(disambiguation(commands, 'commands'));
			} else {
				return msg.reply(
					`Unable to identify command. Use \`${msg.guild.commandPrefix}commands\` to view the list of command groups or \`${msg.guild.commandPrefix}commands <groupName>\` to view the list of commands in a given group.`);
			}
		} else {
			helpEmbed
				.setTitle('**Help**')
				.setThumbnail(`${this.client.user.avatarURL()}`)
				.setDescription(stripIndents`
					To get the list of command groups, type \`${msg.guild.commandPrefix}commands\`.
					To get the list of commands in a specific group, type \`${msg.guild.commandPrefix}commands <groupName>\`.
					To get help with a specific command, type \`${msg.guild.commandPrefix}help <commandName>\`.
				`)
				.addField('❯ Spudnik Command', '[Join](https://spudnik.io/support)', true)
				.addField('❯ Invite to Your Server!', '[Invite](https://spudnik.io/invite)', true)
				.setFooter(`Server Prefix: ${msg.guild.commandPrefix} • Total Commands: ${this.client.registry.commands.size}`);
			
			deleteCommandMessages(msg);

			return msg.embed(helpEmbed);
		}
	}
}
