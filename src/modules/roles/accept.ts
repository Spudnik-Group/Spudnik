import { stripIndents } from 'common-tags';
import { Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, stopTyping, startTyping } from '../../lib/helpers';
import * as format from 'date-fns/format';

/**
 * Accept the guild rules, and be auto-assigned the default role.
 *
 * @export
 * @class AcceptCommand
 * @extends {Command}
 */
export default class AcceptCommand extends Command {
	/**
	 * Creates an instance of AcceptCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof AcceptCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			clientPermissions: ['MANAGE_ROLES'],
			description: 'Accept the Terms of Use for the current guild.',
			examples: [
				'!accept'
			],
			group: 'roles',
			guildOnly: true,
			memberName: 'accept',
			name: 'accept',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "accept" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ channel: Channel }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof AcceptCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		const acceptEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Accept'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();

		const defaultRoles: string[] = msg.guild.settings.get('defaultRoles', []);
		const acceptChannel: string = msg.guild.settings.get('tosChannel', null);

		if (defaultRoles.length > 0 && msg.channel.id === acceptChannel) {
			startTyping(msg);
			const defaultRoleList: Role[] = [];
			defaultRoles.forEach(roleId => {
				defaultRoleList.push(msg.guild.roles.get(roleId))
			});
			defaultRoleList.filter(role => role).forEach(async(role) => {
				try {
					await msg.member.roles.add(role);
				} catch (err) {
					this.catchError(msg, err);
				}
			});

			// Set up embed message
			acceptEmbed.setDescription(stripIndents`
				**Member:** ${msg.author.tag} (${msg.author.id})
				**Action:** The default role(s) of \`${defaultRoles.join(', ')}\` for the guild ${msg.guild.name} has been applied.
			`);

			// Log the event in the mod log
			modLogMessage(msg, acceptEmbed);

			msg.delete();
			stopTyping(msg);

			// Reply to the new member
			return msg.reply(acceptEmbed);
		}
	}
	
	private catchError(msg: CommandoMessage, err: Error) {
		// Build warning message
		let acceptWarn = stripIndents`
			Error occurred in \`accept\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		`;
		acceptWarn += stripIndents`
			**Error Message:** ${err}`;
		
		stopTyping(msg);

		// Emit warn event for debugging
		msg.client.emit('warn', acceptWarn);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, 'An error occured, an admin will need to assign the default role');
	}
}
