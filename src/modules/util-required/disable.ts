import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient, CommandGroup } from 'discord.js-commando';
import { stripIndents } from 'common-tags';
import { deleteCommandMessages, modLogMessage, getEmbedColor } from '../../lib/custom-helpers';
import { stopTyping, startTyping, sendSimpleEmbeddedError } from '../../lib/helpers';

/**
 * Disables a command or command group.
 *
 * @export
 * @class DisableCommandCommand
 * @extends {Command}
 */
export default class DisableCommandCommand extends Command {
	/**
	 * Creates an instance of DisableCommandCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof DisableCommandCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['disable-command', 'cmd-off', 'command-off'],
			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: 'Which command or group would you like to disable?',
					type: 'group|command'
				}
			],
			description: 'Disables a command or command group.',
			details: stripIndents`
				syntax: \`!disable <command|commandGroup>\`
				
				The argument must be the name/ID (partial or whole) of a command or command group.

				ADMINISTRATOR permission required.
			`,
			examples: ['disable util', 'disable Utility', 'disable prefix'],
			group: 'util-required',
			guarded: true,
			guildOnly: true,
			memberName: 'disable',
			name: 'disable'
		});
	}

	/**
     * Check if the user has the right permissions to run the command.
     * 
     * @param {CommandoMessage} msg
     * @returns {boolean}
	 * @memberof DisableCommandCommand
     */
	public hasPermission(msg: CommandoMessage): boolean {
		if(!msg.guild) return this.client.isOwner(msg.author);

		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	/**
	 * Run the "DisableCommand" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ cmdOrGrp: Command | CommandGroup }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof DisableCommandCommand
	 */
	public async run(msg: CommandoMessage, args: {cmdOrGrp: Command | CommandGroup}): Promise<Message | Message[]> {
		const group = (args.cmdOrGrp as Command).group;
		const disableEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/cross-mark_274c.png',
				name: 'Disable'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		startTyping(msg);

		if (!args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			stopTyping(msg);

			return sendSimpleEmbeddedError(msg,
				`The \`${args.cmdOrGrp.name}\` ${group ? 'command' : 'group'} is already disabled.`, 3000);
		}

		if(args.cmdOrGrp.guarded) {
			stopTyping(msg);

			return sendSimpleEmbeddedError(msg,
				`You cannot disable the \`${args.cmdOrGrp.name}\` ${group ? 'command' : 'group'}.`, 3000
			);
		}

		args.cmdOrGrp.setEnabledIn(msg.guild, false);
		disableEmbed.setDescription(stripIndents`
			**Moderator:** ${msg.author.tag} (${msg.author.id})
			**Action:** Disabled the \`${args.cmdOrGrp.name}\` ${group ? 'command' : 'group'}.`);
		deleteCommandMessages(msg);
		modLogMessage(msg, disableEmbed);
		stopTyping(msg);
		
		return msg.embed(disableEmbed);
	}
}
