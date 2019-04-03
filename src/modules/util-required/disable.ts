import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient, CommandGroup } from 'discord.js-commando';
import { stripIndents } from 'common-tags';

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
		if(!args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			return msg.reply(
				`The \`${args.cmdOrGrp.name}\` ${group ? 'command' : 'group'} is already disabled.`
			);
		}
		if(args.cmdOrGrp.guarded) {
			return msg.reply(
				`You cannot disable the \`${args.cmdOrGrp.name}\` ${group ? 'command' : 'group'}.`
			);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, false);
		return msg.reply(`Disabled the \`${args.cmdOrGrp.name}\` ${group ? 'command' : 'group'}.`);
	}
}
