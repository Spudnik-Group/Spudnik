import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';

/**
 * Adjusts starboard settings.
 *
 * @export
 * @class StarboardCommand
 * @extends {Command}
 */
export default class StarboardCommand extends Command {
	/**
	 * Creates an instance of StarboardCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof StarboardCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Used to set the emoji to trigger saving a message to the starboard, show the current starboard settings, change the starboard channel, and enables or disables the starboard',
			details: 'trigger <emoji to save messages to starboard (leave blank to show current)> | channel | enable | disable',
			group: 'util',
			guildOnly: true,
			memberName: 'starboard',
			name: 'starboard',
			args: [
				{
					key: 'subCommand',
					prompt: 'channel|trigger|enable|disable\n',
					type: 'string',
				},
				{
					default: '',
					key: 'content',
					prompt: 'what would you like the trigger set to?\n',
					type: 'string',
				},
			],
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	/**
	 * Determine if a member has permission to run the "starboard" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {boolean}
	 * @memberof StarboardCommand
	 */
	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
	}

	/**
	 * Run the "starboard" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ limit: number, filter: string, member: GuildMember }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof StarboardCommand
	 */
	public async run(msg: CommandMessage, args: { subCommand: string, content: string }): Promise<Message | Message[]> {
		const starboardEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			author: {
				name: 'Star Board',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/133/white-medium-star_2b50.png',
			},
		});

		const starboard = msg.client.provider.get(msg.guild, 'starboardChannel');
		const starboardTrigger = msg.client.provider.get(msg.guild, 'starboardTrigger', '⭐');
		const starboardEnabled = msg.client.provider.get(msg.guild, 'starboardEnabled', false);
		switch (args.subCommand.toLowerCase()) {
			case 'channel': {
				if (starboard === msg.channel.id) {
					starboardEmbed.description = `Star Board channel already set to <#${msg.channel.id}>!`;
					return msg.embed(starboardEmbed);
				} else {
					return msg.client.provider.set(msg.guild, 'starboardChannel', msg.channel.id).then(() => {
						starboardEmbed.description = `Star Board channel set to <#${msg.channel.id}>.`;
						return msg.embed(starboardEmbed);
					}).catch(() => {
						starboardEmbed.description = 'There was an error processing the request.';
						return msg.embed(starboardEmbed);
					});
				}
			}
			case 'trigger': {
				const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
				if (args.content === undefined || args.content === '' || !args.content.match(emojiRegex)) {
					starboardEmbed.description = 'You must include the new emoji trigger along with the `trigger` command. See `help starboard` for details.\nThe current Star Board emoji is set to: ' + starboardTrigger;
					return msg.embed(starboardEmbed);
				} else {
					return msg.client.provider.set(msg.guild, 'starboardTrigger', args.content).then(() => {
						starboardEmbed.description = 'Star Board trigger set to: ' + args.content + '\nCurrently, the Star Board is set to: ' + starboardEnabled ? '_ON_' : '_OFF_' + '\nAnd, starred messages are being saved in this channel: <#' + starboard + '>';
						return msg.embed(starboardEmbed);
					});
				}
			}
			case 'enable': {
				if (starboardEnabled === false) {
					return msg.client.provider.set(msg.guild, 'starboardEnabled', true).then(() => {
						starboardEmbed.description = `Star Board enabled.\nChannel set to: <#${starboard}>\nTrigger set to: ${starboardTrigger}`;
						return msg.embed(starboardEmbed);
					}).catch(() => {
						starboardEmbed.description = 'There was an error processing the request.';
						return msg.embed(starboardEmbed);
					});
				} else {
					starboardEmbed.description = 'Star Board is already enabled! Disable with `starboard disable`';
					return msg.embed(starboardEmbed);
				}
			}
			case 'disable': {
				if (starboardEnabled === true) {
					return msg.client.provider.set(msg.guild, 'starboardEnabled', false).then(() => {
						starboardEmbed.description = `Star Board disabled.\nChannel set to: <#${starboard}>\nTrigger set to: ${starboardTrigger}`;
						return msg.embed(starboardEmbed);
					}).catch(() => {
						starboardEmbed.description = 'There was an error processing the request.';
						return msg.embed(starboardEmbed);
					});
				} else {
					starboardEmbed.description = 'Star Board is already disabled! Enable with `starboard enable`';
					return msg.embed(starboardEmbed);
				}
			}
			default: {
				starboardEmbed.description = 'Invalid subcommand. Please see `help starboard`.';
				return msg.embed(starboardEmbed);
			}
		}
	}
}
