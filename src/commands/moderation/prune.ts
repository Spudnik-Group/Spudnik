/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, Permissions, User } from 'discord.js';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';

/**
 * Deletes previous messages.
 *
 * @export
 * @class PruneCommand
 * @extends {Command}
 */
export default class PruneCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['clean', 'purge', 'clear'],
			description: 'Deletes messages.',
			extendedHelp: stripIndents`
				List of filters:
				\`invites\`: Messages containing an invite
				\`@usermention\`: Messages sent by @user
				\`bots\`: Messages sent by bots
				\`uploads\`: Messages containing an attachment
				\`me\`: Messages sent by you
				\`links\`: Messages containing a link
			`,
			permissionLevel: 1, // MANAGE_MESSAGES
			requiredPermissions: Permissions.FLAGS.MANAGE_MESSAGES,
			usage: '<limit:integer{1,100}> [links|invites|bots|me|uploads|user:user]'
		});
	}

	/**
	 * Run the "prune" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ limit: number, filter: string, member: GuildMember }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof PruneCommand
	 */
	public async run(msg: KlasaMessage, [limit, filter]: [number, string|User]): Promise<KlasaMessage | KlasaMessage[]> {
		await msg.delete();

		let messages = await msg.channel.messages.fetch({ limit: 100 });
		if (filter) {
			const user = typeof filter === 'string' ? null : filter;
			const type = typeof filter === 'string' ? filter : 'user';
			messages = messages.filter(this.getFilter(msg, type, user));
		}
		const messagesToDelete = messages.array().slice(0, limit);
		try {
			await msg.channel.bulkDelete(messagesToDelete.reverse());
			// Log the event in the mod log
			const modlogEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Prune)
				.setDescription(stripIndents`
					**Moderator:** ${msg.author.tag} (${msg.author.id})
					**Action:** Prune
					**Details:** Deleted ${limit} messages from <#${msg.channel.id}>
					${filter ? `**Filter:** ${filter}` : ''}
				`);
			await modLogMessage(msg, modlogEmbed);

			return msg.sendSimpleEmbed(`Pruned ${limit} message${(limit > 1) ? 's' : ''}`, 5000);
		} catch (err) {
			return this.catchError(msg, { limit, filter: filter?.toString() }, err);
		}
	}

	private getFilter(msg: KlasaMessage, filter: any, user: User): any {
		switch (filter) {
			case 'links': return (mes: KlasaMessage): boolean => /https?:\/\/[^ /.]+\.[^ /.]+/.test(mes.content);
			case 'invites': return (mes: KlasaMessage): boolean => /(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/.test(mes.content);
			case 'bots': return (mes: KlasaMessage): boolean => mes.author.bot;
			case 'me': return (mes: KlasaMessage): boolean => mes.author.id === msg.author.id;
			case 'uploads': return (mes: KlasaMessage): boolean => mes.attachments.size > 0;
			case 'user': return (mes: KlasaMessage): boolean => mes.author.id === user.id;
			default: return (): boolean => true;
		}
	}

	private catchError(msg: KlasaMessage, args: { limit: number; filter: string }, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
		Error occurred in \`prune\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
		**Input:** \`limit: ${args.limit} | filter: ${args.filter}\`
		**Error Message:** ${err}`);

		// Inform the user the command failed
		return msg.sendSimpleError(`Pruning ${args.limit} messages failed!`, 3000);
	}

}
