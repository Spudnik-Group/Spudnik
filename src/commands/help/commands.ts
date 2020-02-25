/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed, Permissions } from 'discord.js';
import { getEmbedColor, sendSimpleEmbeddedMessage } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import * as fs from 'fs';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

/**
 * Returns a list of command groups, or all commands in a given group.
 *
 * @export
 * @class CommandsCommand
 * @extends {Command}
 */
export default class CommandsCommand extends Command {

public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns a list of command groups, or all commands in a given group.',
			guarded: true,
			name: 'commands',
			requiredPermissions: Permissions.FLAGS.EMBED_LINKS,
			usage: '[groupName:string]'
		});
	}

	/**
	 * Run the "commands" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ categoryName: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof CommandsCommand
	 */
	public async run(msg: KlasaMessage, [groupName]): Promise<KlasaMessage | KlasaMessage[]> {
		const commandsEmbed: MessageEmbed = new MessageEmbed()
			.setColor(getEmbedColor(msg))
			.setFooter(`Comrade! I bring ${this.client.commands.size} commands in this version!`);

		const groups: any[] = fs.readdirSync('commands')
			.filter(path => fs.statSync(`commands/${path}`).isDirectory());

		if (groupName) {
			const parsedGroup: string = groupName.toLowerCase();

			if (groups.find((g: string) => g === parsedGroup)) {
				const commands = this.client.commands.array().filter((command: Command) => command.category === parsedGroup);
				commandsEmbed
					.setTitle(`List of commands in the ${groupName} category`)
					.setDescription(`Use the \`commands\` command to get a list of all ${groups.length} command groups.`)
					.addField(`❯ ${commands.length} ${groupName} Commands`, `\`\`\`css\n${commands.map((c: any) => c.name).join('\n')}\`\`\``)
					.addField('❯ Need more details?', `Run \`${msg.guild.settings.get(GuildSettings.Prefix)}help <commandName>\``)
					.addField('❯ Want the complete list of commands?', 'Visit [the website](https://spudnik.io) and check out the commands page: https://docs.spudnik.io/commands/');

				return msg.sendEmbed(commandsEmbed);
			}
			return sendSimpleEmbeddedMessage(msg, `No groups matching that name. Use \`${msg.guild.settings.get(GuildSettings.Prefix)}commands\` to view a list of command groups.`, 3000);

		}
		commandsEmbed
			.setTitle('List of Command Groups')
			.setDescription(`Run \`${msg.guild.settings.get(GuildSettings.Prefix)}commands <groupName>\` to view all the commands in the given group.`)
			.addField('❯ Command Groups', `\`\`\`css\n${groups.join('\n')}\`\`\``)
			.addField('❯ Need more details?', `Run \`${msg.guild.settings.get(GuildSettings.Prefix)}help <commandName>\``)
			.addField('❯ Want the complete list of commands?', 'Visit [the website](https://spudnik.io) and check out the commands page: https://docs.spudnik.io/commands/');

		return msg.sendEmbed(commandsEmbed);

	}

}
