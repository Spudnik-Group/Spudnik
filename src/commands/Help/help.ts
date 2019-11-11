import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { getEmbedColor, getPermissionsFromBitfield, getPermissionsFromLevel, isCommandEnabledInGuild } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Used to return helpful information on the bot, or detailed information for a specified command.',
			guarded: true,
			name: 'help',
			usage: '[command:cmd]'
		});
	}

	/**
	 * Run the "Help" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ command: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof HelpCommand
	 */
	public async run(msg: KlasaMessage, [command]): Promise<KlasaMessage | KlasaMessage[]> {
		const helpEmbed: MessageEmbed = new MessageEmbed()
			.setColor(getEmbedColor(msg));
		if (command) {
			helpEmbed
				.setTitle(`__Command: **${command.name}**__`)
				.addField('❯ Description', command.description)
				.addField('❯ Usage', command.usage.fullUsage(msg))
				.addField('❯ Details', typeof command.extendedHelp === 'function' ? command.extendedHelp() : command.extendedHelp)
				.addField('❯ Aliases', command.aliases.length > 0 ? command.aliases.join(', ') : 'None', true)
				.addField('❯ Group', `${command.category}`, true)
				.addField('❯ BOT Permissions', command.requiredPermissions ? getPermissionsFromBitfield(command.requiredPermissions).join('\n') : 'No extra perms required', true)
				.addField('❯ User Permission Level', command.permissionLevel ? `${command.permissionLevel}: ${getPermissionsFromLevel(command.permissionLevel)}` : 'No special user perms required', true)
				.addField('❯ Other Details', stripIndents`
					NSFW Only: ${command.nsfw ? '**Yes**' : '**No**'}
					Enabled: ${isCommandEnabledInGuild(msg, command.name) ? '**Yes**' : '**No**'}
				`, true);

			return msg.sendEmbed(helpEmbed);
		} else {
			helpEmbed
				.setTitle('**Help**')
				.setThumbnail(`${this.client.user.avatarURL()}`)
				.setDescription(stripIndents`
					To get the list of command groups, type \`${msg.guild.settings['prefix']}commands\`.
					To get the list of commands in a specific group, type \`${msg.guild.settings['prefix']}commands <groupName>\`.
					To get help with a specific command, type \`${msg.guild.settings['prefix']}help <commandName>\`.
				`)
				.addField('❯ Spudnik Command', '[Join](https://spudnik.io/support)', true)
				.addField('❯ Invite to Your Server!', '[Invite](https://spudnik.io/invite)', true)
				.setFooter(`Server Prefix: ${msg.guild.settings['prefix']} • Total Commands: ${this.client.commands.size}`);

			return msg.sendEmbed(helpEmbed);
		}
	}
}
