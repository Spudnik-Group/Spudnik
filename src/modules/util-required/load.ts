import { Message } from 'discord.js';
import * as fs from 'fs';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { stripIndents } from 'common-tags';

/**
 * Loads a command.
 *
 * @export
 * @class LoadCommandCommand
 * @extends {Command}
 */
export default class LoadCommandCommand extends Command {
	/**
	 * Creates an instance of LoadCommandCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof LoadCommandCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['load-command'],
			args: [
				{
					key: 'command',
					parse: (val: string) => {
						const split = val.split(':');
						const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1]);
						delete require.cache[cmdPath];
						return require(cmdPath);
					},
					prompt: 'Which command would you like to load?',
					validate: (val: string) => new Promise(resolve => {
						if(!val) return resolve(false);
						const split = val.split(':');
						if(split.length !== 2) return resolve(false);
						if(this.client.registry.findCommands(val).length > 0) {
							return resolve('That command is already registered.');
						}
						const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1]);
						fs.access(cmdPath, fs.constants.R_OK, err => err ? resolve(false) : resolve(true));
						return null;
					})
				}
			],
			description: 'Loads a new command.',
			details: stripIndents`
				The argument must be full name of the command in the format of \`group:memberName\`.

				Only the bot owner(s) may use this command.
			`,
			examples: ['load some-command'],
			group: 'util-required',
			guarded: true,
			hidden: true,
			memberName: 'load',
			name: 'load',
			ownerOnly: true
		});
	}

	/**
	 * Run the "LoadCommand" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ command: Command }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof LoadCommandCommand
	 */
	public async run(msg: CommandoMessage, args: {command: Command}): Promise<Message | Message[]> {
		this.client.registry.registerCommand(args.command);
		const command = this.client.registry.commands.last();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					if(this.shard.id !== ${this.client.shard.id}) {
						const cmdPath = this.registry.resolveCommandPath('${command.groupID}', '${command.name}');
						delete require.cache[cmdPath];
						this.registry.registerCommand(require(cmdPath));
					}
				`);
			} catch(err) {
				this.client.emit('warn', 'Error when broadcasting command load to other shards');
				this.client.emit('error', err);
				await msg.reply(`Loaded \`${command.name}\` command, but failed to load on other shards.`);
				return null;
			}
		}

		await msg.reply(`Loaded \`${command.name}\` command${this.client.shard ? ' on all shards' : ''}.`);
		return null;
	}
}
