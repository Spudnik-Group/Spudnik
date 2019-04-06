import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient, CommandGroup } from 'discord.js-commando';
import { stripIndents } from 'common-tags';

/**
 * Reloads a command or command group.
 *
 * @export
 * @class ReloadCommandCommand
 * @extends {Command}
 */
export default class ReloadCommandCommand extends Command {
	/**
	 * Creates an instance of ReloadCommandCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ReloadCommandCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['reload-command'],
			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: 'Which command or group would you like to reload?',
					type: 'group|command'
				}
			],
			description: 'Reloads a command or command group.',
			details: stripIndents`
				The argument must be the name/ID (partial or whole) of a command or command group.
				Providing a command group will reload all of the commands in that group.

				Only the bot owner(s) may use this command.
			`,
			examples: ['reload some-command'],
			group: 'util-required',
			guarded: true,
			hidden: true,
			memberName: 'reload',
			name: 'reload',
			ownerOnly: true
		});
	}

	/**
	 * Run the "ReloadCommand" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ cmdOrGrp: Command | CommandGroup }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof ReloadCommandCommand
	 */
	public async run(msg: CommandoMessage, args: {cmdOrGrp: Command | CommandGroup}): Promise<Message | Message[]> {
		const { cmdOrGrp } = args;
		const isCmd = Boolean((cmdOrGrp as Command).groupID);
		cmdOrGrp.reload();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					if(this.shard.id !== ${this.client.shard.id}) {
						this.registry.${isCmd ? 'commands' : 'groups'}.get('${isCmd ? cmdOrGrp.name : (cmdOrGrp as CommandGroup).id}').reload();
					}
				`);
			} catch(err) {
				this.client.emit('warn', 'Error when broadcasting command reload to other shards');
				this.client.emit('error', err);

				if(isCmd) {
					await msg.reply(`Reloaded \`${cmdOrGrp.name}\` command, but failed to reload on other shards.`);
				} else {
					await msg.reply(
						`Reloaded all of the commands in the \`${cmdOrGrp.name}\` group, but failed to reload on other shards.`
					);
				}
				
				return null;
			}
		}

		if(isCmd) {
			await msg.reply(`Reloaded \`${cmdOrGrp.name}\` command${this.client.shard ? ' on all shards' : ''}.`);
		} else {
			await msg.reply(
				`Reloaded all of the commands in the \`${cmdOrGrp.name}\` group${this.client.shard ? ' on all shards' : ''}.`
			);
		}
		
		return null;
	}
}
