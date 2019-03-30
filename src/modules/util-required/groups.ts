import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { stripIndents } from 'common-tags';

/**
 * Lists all command groups.
 *
 * @export
 * @class ListGroupsCommand
 * @extends {Command}
 */
export default class ListGroupsCommand extends Command {
	/**
	 * Creates an instance of ListGroupsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ListGroupsCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['list-groups', 'show-groups'],
			description: 'Lists all command groups.',
			details: 'ADMINISTRATOR permission required.',
			group: 'commands',
			guarded: true,
			memberName: 'groups',
			name: 'groups'
		});
	}

	/**
     * Check if the user has the right permissions to run the command.
     * 
     * @param {CommandoMessage} msg
     * @returns {boolean}
	 * @memberof ListGroupsCommand
     */
	public hasPermission(msg: CommandoMessage): boolean {
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	/**
	 * Run the "ListGroups" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof ListGroupsCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		return msg.reply(stripIndents`
			__**Groups**__
			${this.client.registry.groups.map(grp =>
				`**${grp.name}:** ${grp.isEnabledIn(msg.guild) ? 'Enabled' : 'Disabled'}`
			).join('\n')}
		`);
	}
}
