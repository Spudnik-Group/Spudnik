import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient, CommandGroup } from 'discord.js-commando';
import { stripIndents } from 'common-tags';
import { getEmbedColor, deleteCommandMessages, modLogMessage } from '../../lib/custom-helpers';
import { startTyping, stopTyping, sendSimpleEmbeddedError } from '../../lib/helpers';

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
			details: stripIndents`
				syntax: \`!enable <command|commandGroup>\`

				The argument must be the name/ID (partial or whole) of a command or command group.
				
				\`ADMINISTRATOR\` permission required.
			`,
			examples: ['enable util', 'enable Utility', 'enable prefix'],
			group: 'util-required',
			guarded: true,
			guildOnly: true,
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
	 * @param {{ cmdOrGrp: Command | CommandGroup }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof EnableCommandCommand
	 */
	public async run(msg: CommandoMessage, args: {cmdOrGrp: Command | CommandGroup}): Promise<Message | Message[]> {
		const group = (args.cmdOrGrp as Command).group;
		const enableEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/heavy-check-mark_2714.png',
				name: 'Enable'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		startTyping(msg);

		if (args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			stopTyping(msg);

			return sendSimpleEmbeddedError(msg,
				`The \`${args.cmdOrGrp.name}\` ${group ? 'command' : 'group'} is already enabled${
					group && !group.isEnabledIn(msg.guild) ?
					`, but the \`${group.name}\` group is disabled, so it still can't be used` :
					''
				}.`, 3000);
		}

		args.cmdOrGrp.setEnabledIn(msg.guild, true);
		enableEmbed.setDescription(stripIndents`
			**Moderator:** ${msg.author.tag} (${msg.author.id})
			**Action:** Enabled the \`${args.cmdOrGrp.name}\` ${group ? 'command' : 'group'}${
				group && !group.isEnabledIn(msg.guild) ?
				`, but the \`${group.name}\` group is disabled, so it still can't be used` :
				''
			}.`);
		deleteCommandMessages(msg);
		modLogMessage(msg, enableEmbed);
		stopTyping(msg);
		
		return msg.embed(enableEmbed);
	}
}
