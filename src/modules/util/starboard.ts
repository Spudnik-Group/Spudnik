import { Message, MessageEmbed, Channel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

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
			args: [
				{
					key: 'subCommand',
					prompt: 'What sub-command would you like to use?\nOptions are:\n* channel\n* trigger\n* enable\n* disable',
					type: 'string'
				},
				{
					default: '',
					key: 'content',
					prompt: 'What would you like it set to?\n',
					type: 'string|channel'
				}
			],
			description: 'Used to configure the :star: Star Board feature.',
			details: 'syntax: `!starboard (channel|trigger|enable|disable) [new starboard emoji|channel id]`\n`(channel) (channel id)` - sets Star Board channel to the channel supplied.\n`trigger [emoji]` - sets emoji to save to star board. If blank, shows current trigger emoji.\n`!enable` - enables the Star Board feature.\n`!disable` - disables the Star Board feature.\n\nAdministrator permission required.',
			examples: ['!starboard channel 1132423443', '!starboard trigger', '!starboard trigger :stuck_out_tongue:', '!starboard enable', '!starboard disable'],
			group: 'util',
			guildOnly: true,
			memberName: 'starboard',
			name: 'starboard',
			throttling: {
				duration: 3,
				usages: 2
			}
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
	public async run(msg: CommandMessage, args: { subCommand: string, content: Channel | string }): Promise<Message | Message[]> {
		const starboardEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			author: {
				name: 'Star Board',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/133/white-medium-star_2b50.png'
			}
		});

		const starboard = msg.client.provider.get(msg.guild, 'starboardChannel');
		const starboardTrigger = msg.client.provider.get(msg.guild, 'starboardTrigger', '⭐');
		const starboardEnabled = msg.client.provider.get(msg.guild, 'starboardEnabled', false);
		switch (args.subCommand.toLowerCase()) {
			case 'channel': {
				if (args.content instanceof Channel) {
					if (starboard === args.content) {
						starboardEmbed.description = `Star Board channel already set to <#${args.content}>!\n\n---\nStar Board feature: ${starboardEnabled ? '_Enabled_' : '_Disabled_'}\nChannel set to: <#${starboard}>\nTrigger set to: ${starboardTrigger}`;
						return msg.embed(starboardEmbed);
					} else {
						return msg.client.provider.set(msg.guild, 'starboardChannel', args.content)
							.then(() => {
								starboardEmbed.description = `Star Board channel set to <#${args.content}>.\n\n---\nStar Board feature: ${starboardEnabled ? '_Enabled_' : '_Disabled_'}\nChannel set to: <#${starboard}>\nTrigger set to: ${starboardTrigger}`;
								return msg.embed(starboardEmbed);
							})
							.catch((err: Error) => {
								msg.client.emit('warn', `Error in command util:starboard: ${err}`);
								return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
							});
					}
				} else {
					return sendSimpleEmbeddedError(msg, 'Invalid channel provided.', 3000);
				}
			}
			case 'trigger': {
				const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
				if (args.content === undefined || args.content === '' || !args.content.match(emojiRegex)) {
					starboardEmbed.description = `You must include the new emoji trigger along with the \`trigger\` command. See \`help starboard\` for details.\n\n---\nStar Board feature: ${starboardEnabled ? '_Enabled_' : '_Disabled_'}\nChannel set to: <#${starboard}>\nTrigger set to: ${starboardTrigger}`;
					return msg.embed(starboardEmbed);
				} else {
					return msg.client.provider.set(msg.guild, 'starboardTrigger', args.content)
						.then(() => {
							starboardEmbed.description = 'Star Board trigger set to: ' + args.content + `\n\n---\nStar Board feature: ${starboardEnabled ? '_Enabled_' : '_Disabled_'}\nChannel set to: <#${starboard}>\nTrigger set to: ${starboardTrigger}`;
							return msg.embed(starboardEmbed);
						});
				}
			}
			case 'enable': {
				if (starboardEnabled === false) {
					return msg.client.provider.set(msg.guild, 'starboardEnabled', true)
						.then(() => {
							starboardEmbed.description = `Star Board enabled.\n\n---\nStar Board feature: ${starboardEnabled ? '_Enabled_' : '_Disabled_'}\nChannel set to: <#${starboard}>\nTrigger set to: ${starboardTrigger}`;
							return msg.embed(starboardEmbed);
						})
						.catch((err: Error) => {
							msg.client.emit('warn', `Error in command util:starboard: ${err}`);
							return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
						});
				} else {
					starboardEmbed.description = 'Star Board is already enabled! Disable with `starboard disable`';
					return msg.embed(starboardEmbed);
				}
			}
			case 'disable': {
				if (starboardEnabled === true) {
					return msg.client.provider.set(msg.guild, 'starboardEnabled', false)
						.then(() => {
							starboardEmbed.description = `Star Board disabled.\n\n---\nStar Board feature: ${starboardEnabled ? '_Enabled_' : '_Disabled_'}\nChannel set to: <#${starboard}>\nTrigger set to: ${starboardTrigger}`;
							return msg.embed(starboardEmbed);
						})
						.catch((err: Error) => {
							msg.client.emit('warn', `Error in command util:starboard: ${err}`);
							return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
						});
				} else {
					starboardEmbed.description = 'Star Board is already disabled! Enable with `starboard enable`';
					return msg.embed(starboardEmbed);
				}
			}
			default: {
				return sendSimpleEmbeddedError(msg, 'Invalid subcommand. Please see `help starboard`.', 3000);
			}
		}
	}
}
