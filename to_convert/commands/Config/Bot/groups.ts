import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['list-groups', 'show-groups'],
			description: 'Lists all command groups.',
			details: '\`ADMINISTRATOR\` permission required.',
			group: 'util-required',
			guarded: true,
			guildOnly: true,
			memberName: 'groups',
			name: 'groups'
		});
	}

	/**
     * Check if the user has the right permissions to run the command.
     * 
     * @param {KlasaMessage} msg
     * @returns {boolean}
	 * @memberof ListGroupsCommand
     */
	public hasPermission(msg: KlasaMessage): boolean {
		if(!msg.guild) return this.client.isOwner(msg.author);
		
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	/**
	 * Run the "ListGroups" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ListGroupsCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.reply(stripIndents`
			__**Groups**__
			${this.client.registry.groups.map(grp =>
				`**${grp.name}:** ${grp.isEnabledIn(msg.guild) ? 'Enabled' : 'Disabled'}`
			).join('\n')}
		`);
	}
}
