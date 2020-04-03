import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Returns a list of command groups, or all commands in a given group.
 *
 * @export
 * @class CommandsCommand
 * @extends {Command}
 */
export default class CommandsCommand extends Command {
	/**
	 * Creates an instance of CommandsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof CommandsCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					default: '',
					key: 'groupName',
					prompt: 'Which group would you like to view the commands for?',
					type: 'string'
				}
			],
			description: 'Returns a list of command groups, or all commands in a given group.',
			examples: [
				'!commands',
				'!commands gaming'
			],
			group: 'help',
			guarded: true,
			guildOnly: true,
			memberName: 'commands',
			name: 'commands',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "commands" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ categoryName: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof CommandsCommand
	 */
	public async run(msg: CommandoMessage, args: { groupName: string }): Promise<Message | Message[]> {
		const commandsEmbed: MessageEmbed = new MessageEmbed()
			.setColor(getEmbedColor(msg))
			.setFooter(`Comrade! I bring ${this.client.registry.commands.size} commands in this version!`);
		const groupsMap: Map<string, any> = this.client.registry.groups;
		let groups: any[] = [];
		for (let [key] of groupsMap) {
			groups.push(key);
		}
		
		if (args.groupName) {
			if (groups.find((g: any) => g === args.groupName.toLowerCase())) {
				const commands = this.client.registry.commands.array().filter((command: any) => command.groupID === args.groupName.toLowerCase());
				commandsEmbed
					.setTitle(`List of commands in the ${args.groupName} category`)
					.setDescription(`Use the \`commands\` command to get a list of all ${groups.length} command groups.`)
					.addField(`❯ ${commands.length} ${args.groupName} Commands`, `\`\`\`css\n${commands.map((c: any) => c.name).join('\n')}\`\`\``)
					.addField('❯ Need more details?', `Run \`${msg.guild.commandPrefix}help <commandName>\``)
					.addField('❯ Want the complete list of commands?', 'Visit [the website](https://spudnik.io) and check out the commands page: https://docs.spudnik.io/commands/');
				
				deleteCommandMessages(msg);
				
				return msg.embed(commandsEmbed);
			} else {
				return sendSimpleEmbeddedMessage(msg, `No groups matching that name. Use \`${msg.guild.commandPrefix}commands\` to view a list of command groups.`, 3000);
			}
		} else {
			commandsEmbed
				.setTitle('List of Command Groups')
				.setDescription(`Run \`${msg.guild.commandPrefix}commands <groupName>\` to view all the commands in the given group.`)
				.addField('❯ Command Groups', `\`\`\`css\n${groups.join('\n')}\`\`\``)
				.addField('❯ Need more details?', `Run \`${msg.guild.commandPrefix}help <commandName>\``)
				.addField('❯ Want the complete list of commands?', 'Visit [the website](https://spudnik.io) and check out the commands page: https://docs.spudnik.io/commands/');
			
			deleteCommandMessages(msg);
			
			return msg.embed(commandsEmbed);
		}
	}
}
