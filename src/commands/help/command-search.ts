/**
 * Copyright (c) 2020 Spudnik Group
 */

import { getEmbedColor, sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed, Permissions } from 'discord.js';

/**
 * Search for a command with the given text.
 *
 * @export
 * @class CommandSearchCommand
 * @extends {Command}
 */
export default class CommandSearchCommand extends Command {

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Search for a command with the given text.',
			guarded: true,
			name: 'command-search',
			requiredPermissions: Permissions.FLAGS.EMBED_LINKS,
			usage: '<commandName:string>'
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
	public async run(msg: KlasaMessage, [commandName]): Promise<KlasaMessage | KlasaMessage[]> {
		const commandsEmbed: MessageEmbed = new MessageEmbed()
			.setColor(getEmbedColor(msg))
			.setFooter(`Comrade! I bring ${this.client.commands.size} commands in this version!`);
		const commands = this.client.commands.filter(command => command.name.includes(commandName));

		if (commands.size > 0) {
			commandsEmbed
				.setTitle('Command Search')
				.setDescription(`Found ${commands.size} commands containing *${commandName}*.`)
				.addField('❯ Commands', `\`\`\`css\n${msg.guild.settings.get('prefix')}${commands.map((c: any) => c.name).join(`\n${msg.guild.settings.get('prefix')}`)}\`\`\``)
				.addField('❯ Need more details?', `Run \`${msg.guild.settings.get('prefix')}help <commandName>\``)
				.addField('❯ Want the complete list of commands?', 'Visit [the website](https://spudnik.io) and check out the commands page: https://docs.spudnik.io/commands/');

			return msg.sendEmbed(commandsEmbed);
		} else {
			return sendSimpleEmbeddedMessage(msg, `No commands found containing that text. Use \`${msg.guild.settings.get('prefix')}commands\` to view a list of command groups.`, 3000);
		}
	}
}
