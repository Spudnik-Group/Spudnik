import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { oneLine } from 'common-tags';

/**
 * Enables a command or command group.
 *
 * @export
 * @class EnableCommandCommand
 * @extends {Command}
 */
export default class EnableCommandCommand extends Command {
	/**
	 * Creates an instance of EnableCommandCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof EnableCommandCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['enable-command', 'cmd-on', 'command-on'],
			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: 'Which command or group would you like to enable?',
					type: 'group|command'
				}
			],
			description: 'Enables a command or command group.',
			details: oneLine`
				The argument must be the name/ID (partial or whole) of a command or command group.
				Only administrators may use this command.
			`,
			examples: ['enable util', 'enable Utility', 'enable prefix'],
			group: 'util-required',
			guarded: true,
			memberName: 'enable',
			name: 'enable'
		});
	}

    /**
     * Check if the user has the right permissions to run the command.
     * 
     * @param {CommandoMessage} msg
     * @returns {boolean}
	 * @memberof EnableCommandCommand
     */
	public hasPermission(msg: CommandoMessage): boolean {
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	/**
	 * Run the "EnableCommand" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof EnableCommandCommand
	 */
	public async run(msg: CommandoMessage, args: {cmdOrGrp: Command}): Promise<Message | Message[]> {
		const group = args.cmdOrGrp.group;
		if(args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			return msg.reply(
				`The \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'} is already enabled${
					group && !group.isEnabledIn(msg.guild) ?
					`, but the \`${group.name}\` group is disabled, so it still can't be used` :
					''
				}.`
			);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, true);
		return msg.reply(
			`Enabled the \`${args.cmdOrGrp.name}\` ${group ? 'command' : 'group'}${
				group && !group.isEnabledIn(msg.guild) ?
				`, but the \`${group.name}\` group is disabled, so it still can't be used` :
				''
			}.`
		);
	}
}
