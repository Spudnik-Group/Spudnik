/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed, Permissions } from 'discord.js';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { baseEmbed } from '@lib/helpers/embed-helpers';

/**
 * Search for a command with the given text.
 *
 * @export
 * @class CommandSearchCommand
 * @extends {Command}
 */
export default class CommandSearchCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['commandsearch'],
			description: 'Search for a command with the given text.',
			guarded: true,
			requiredPermissions: Permissions.FLAGS.EMBED_LINKS,
			usage: '<commandName:string{2}>'
		});
	}

	/**
	 * Run the "command-search" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ commandName: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof CommandSearchCommand
	 */
	public run(msg: KlasaMessage, [commandName]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const commandsEmbed: MessageEmbed = baseEmbed(msg)
			.setFooter(`Comrade! I bring ${this.client.commands.size} commands in this version!`);
		const commands = this.client.commands.filter((command: Command) => command.name.includes(commandName));

		if (commands.size > 0) {
			commandsEmbed
				.setTitle('Command Search')
				.setDescription(`Found ${commands.size} commands containing *${commandName}*.`)
				.addField('❯ Commands', `\`\`\`css\n${msg.guild.settings.get(GuildSettings.Prefix)}${commands.map((c: any) => c.name).join(`\n${msg.guild.settings.get(GuildSettings.Prefix)}`)}\`\`\``)
				.addField('❯ Need more details?', `Run \`${msg.guild.settings.get(GuildSettings.Prefix)}help <commandName>\``)
				.addField('❯ Want the complete list of commands?', 'Visit [the website](https://spudnik.io) and check out the commands page: https://docs.spudnik.io/commands/');

			return msg.sendEmbed(commandsEmbed);
		}

		return msg.sendSimpleEmbed(`No commands found containing that text. Use \`${msg.guild.settings.get(GuildSettings.Prefix)}commands\` to view a list of command groups.`, 3000);
	}

}
