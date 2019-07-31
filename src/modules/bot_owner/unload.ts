import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { stripIndents } from 'common-tags';

/**
 * Unloads a command.
 *
 * @export
 * @class UnloadCommandCommand
 * @extends {Command}
 */
export default class UnloadCommandCommand extends Command {
	/**
	 * Creates an instance of UnloadCommandCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof UnloadCommandCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['unload-command'],
			args: [
				{
					key: 'command',
					prompt: 'Which command would you like to unload?',
					type: 'command'
				}
			],
			description: 'Unloads a command.',
			details: stripIndents`
				The argument must be the name/ID (partial or whole) of a command.

				Only the bot owner(s) may use this command.
			`,
			examples: ['unload some-command'],
			group: 'bot_owner',
			guarded: true,
			hidden: true,
			memberName: 'unload',
			name: 'unload',
			ownerOnly: true
		});
	}

	/**
	 * Run the "UnloadCommand" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ command: Command }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof UnloadCommandCommand
	 */
	public async run(msg: CommandoMessage, args: {command: Command}): Promise<Message | Message[]> {
		args.command.unload();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					if(this.shard.id !== ${this.client.shard.id}) this.registry.commands.get('${args.command.name}').unload();
				`);
			} catch(err) {
				this.client.emit('warn', 'Error when broadcasting command unload to other shards');
				this.client.emit('error', err);
				await msg.reply(`Unloaded \`${args.command.name}\` command, but failed to unload on other shards.`);
				
				return null;
			}
		}

		await msg.reply(`Unloaded \`${args.command.name}\` command${this.client.shard ? ' on all shards' : ''}.`);
		
		return null;
	}
}
