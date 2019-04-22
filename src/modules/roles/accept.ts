import { stripIndents } from 'common-tags';
import { Channel, Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, stopTyping, startTyping, sendSimpleEmbeddedMessage } from '../../lib/helpers';
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
			args: [
				{
					default: '',
					key: 'channel',
					prompt: 'Please provide a channel to allow the Terms of Service command to be used in.',
					type: 'channel'
				}
			],
			clientPermissions: ['MANAGE_ROLES'],
			description: 'Allows use and configuration of the accept module.',
			details: stripIndents`
				syntax: \`!accept (#channelMention)\`\n
				\n
				No Arguement: Accept the guild rules, and be auto-assigned the default role.\n
				With #channelMention: Sets the channel to listen for the accept command.\n
				MANAGE_ROLES permission required (for setting TOS channel).
			`,
			examples: [
				'!accept',
				'!accept #channelMention'
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
	public async run(msg: CommandoMessage, args: { channel: Channel }): Promise<Message | Message[]> {
		const acceptEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Accept'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();

		startTyping(msg);

		if (args.channel instanceof Channel) {
			const channelID = (args.channel as Channel).id;
			const tosChannel = msg.guild.settings.get('tosChannel', null);

			if (tosChannel && tosChannel === channelID) {
				stopTyping(msg);

				return sendSimpleEmbeddedMessage(msg, `Accept channel already set to <#${channelID}>!`, 3000);
			}

			if (msg.member.hasPermission('MANAGE_ROLES')) {
				msg.guild.settings.set('tosChannel', args.channel.id)
					.then(() => {
						// Set up embed message
						acceptEmbed.setDescription(stripIndents`
							**Member:** ${msg.author.tag} (${msg.author.id})
							**Action:** Accept channel set to <#${args.channel.id}>.
						`);

						return this.sendSuccess(msg, acceptEmbed);
					})
					.catch((err: Error) => this.catchError(msg, args, err));
			} else {
				stopTyping(msg);

				return sendSimpleEmbeddedError(msg, 'You do not have permission to run this command.', 3000);
			}
		} else if (args.channel === '') {
			const acceptRole: string = msg.guild.settings.get('defaultRole', null);
			const role: Role | undefined = msg.guild.roles.get(acceptRole);
			const acceptChannel: string = msg.guild.settings.get('tosChannel', null);

			if (role && !msg.member.roles.has(acceptRole) && msg.channel.id === acceptChannel) {
				msg.member.roles.add(acceptRole)
					.then((member) => {
						// Set up embed message
						acceptEmbed.setDescription(stripIndents`
							**Member:** ${msg.author.tag} (${msg.author.id})
							**Action:** The default role of ${role.name} for the guild ${msg.guild.name} has been applied.
						`);

						// DM the new member
						member.send(acceptEmbed);

						// Log the event in the mod log
						if (msg.guild.settings.get('modlogEnabled', true)) {
							modLogMessage(msg, acceptEmbed);
						}

						deleteCommandMessages(msg);
						stopTyping(msg);
					})
					.catch((err: Error) => this.catchError(msg, args, err));
			}
		}
	}
	
	private catchError(msg: CommandoMessage, args: { channel: Channel }, err: Error) {
		// Build warning message
		let acceptWarn = stripIndents`
			Error occurred in \`accept\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`Accept ${'| channel:' + args.channel}\`
		`;
		let acceptUserWarn = '';
		if (args.channel instanceof Channel) {
			acceptUserWarn = `Failed setting new accept channel to <#${args.channel}>!`;
		} else {
			acceptUserWarn = 'An error occured, an admin will need to assign the default role';
		}
		acceptWarn += stripIndents`
			**Error Message:** ${err}`;
		
		stopTyping(msg);

		// Emit warn event for debugging
		msg.client.emit('warn', acceptWarn);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, acceptUserWarn);
	}

	private sendSuccess(msg: CommandoMessage, embed: MessageEmbed): Promise<Message | Message[]> {
		// Log the event in the mod log
		if (msg.guild.settings.get('modlogEnabled', true)) {
			modLogMessage(msg, embed);
		}

		deleteCommandMessages(msg);
		stopTyping(msg);

		// Send the success response
		return msg.embed(embed);
	}
}
