import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Search for a command with the given text.
 *
 * @export
 * @class CommandSearchCommand
 * @extends {Command}
 */
export default class CommandSearchCommand extends Command {
	/**
	 * Creates an instance of CommandSearchCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof CommandSearchCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'commandName',
					prompt: 'What command text would you like to search for?',
					type: 'string'
				}
			],
			description: 'Search for a command with the given text.',
			examples: [
				'!command-search role',
				'!command-search bacon'
			],
			group: 'help',
			guildOnly: true,
			memberName: 'command-search',
			name: 'command-search',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "command-search" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ commandName: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof CommandSearchCommand
	 */
	public async run(msg: CommandoMessage, args: { commandName: string }): Promise<Message | Message[]> {
		const commandsEmbed: MessageEmbed = new MessageEmbed()
			.setColor(getEmbedColor(msg))
			.setFooter(`Comrade! I bring ${this.client.registry.commands.size} commands in this version!`);
		const commands = this.client.registry.findCommands(args.commandName);
		
		if (commands.length > 0) {
			commandsEmbed
				.setTitle('Command Search')
				.setDescription(`Found ${commands.length} commands containing *${args.commandName}*.`)
				.addField('❯ Commands', `\`\`\`css\n${msg.guild.commandPrefix}${commands.map((c: any) => c.name).join(`\n${msg.guild.commandPrefix}`)}\`\`\``)
				.addField('❯ Need more details?', `Run \`${msg.guild.commandPrefix}help <commandName>\``)
				.addField('❯ Want the complete list of commands?', 'Visit [the website](https://spudnik.io) and check out the commands page: https://docs.spudnik.io/commands/');
			
			deleteCommandMessages(msg);
			
			return msg.embed(commandsEmbed);
		} else {
			return sendSimpleEmbeddedMessage(msg, `No commands found containing that text. Use \`${msg.guild.commandPrefix}commands\` to view a list of command groups.`, 3000);
		}
	}
}
