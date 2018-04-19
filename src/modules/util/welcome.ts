import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';

export default class WelcomeCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Used to set the message to be sent to new users when they join your guild, show the current welcome message, changes the channel for the message to be shown, and enables or disables the message; use {guild} for guild name, and {user} to reference the user joining',
			details: 'message <text to welcome/heckle (leave blank to show current)> | channel | enable | disable',
			group: 'util',
			guildOnly: true,
			memberName: 'welcome',
			name: 'welcome',
			args: [
				{
					key: 'subCommand',
					prompt: 'channel|message|enable|disable\n',
					type: 'string',
				},
				{
					default: '',
					key: 'content',
					prompt: 'what would you like the message set to?\n',
					type: 'string',
				},
			],
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}
	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
	}
	public async run(msg: CommandMessage, args: { subCommand: string, content: string }): Promise<Message | Message[]> {
		const welcomeEmbed = new MessageEmbed({
			color: 5592405,
			author: {
				name: 'Server Welcome Message',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png',
			},
		});

		const welcomeChannel = msg.client.provider.get(msg.guild, 'welcomeChannel', msg.guild.systemChannelID);
		const welcomeMessage = msg.client.provider.get(msg.guild, 'welcomeMessage', '@here, please Welcome {user} to {guild}!');
		const welcomeEnabled = msg.client.provider.get(msg.guild, 'welcomeEnabled', false);
		switch (args.subCommand.toLowerCase()) {
			case 'channel': {
				if (welcomeChannel === msg.channel.id) {
					welcomeEmbed.description = `Welcome channel already set to <#${msg.channel.id}>!`;
					return msg.embed(welcomeEmbed);
				} else {
					return msg.client.provider.set(msg.guild, 'welcomeChannel', msg.channel.id).then(() => {
						welcomeEmbed.description = `Welcome channel set to <#${msg.channel.id}>.`;
						return msg.embed(welcomeEmbed);
					}).catch(() => {
						welcomeEmbed.description = 'There was an error processing the request.';
						return msg.embed(welcomeEmbed);
					});
				}
			}
			case 'message': {
				if (args.content === undefined || args.content === '') {
					welcomeEmbed.description = 'You must include the new message along with the `message` command. See `help welcome` for details.\nThe current welcome message is set to: ```' + welcomeMessage + '```';
					return msg.embed(welcomeEmbed);
				} else {
					return msg.client.provider.set(msg.guild, 'welcomeMessage', args.content).then(() => {
						welcomeEmbed.description = 'Welcome message set to: ```' + args.content + '```' + '\nCurrently, Welcome messages are set to: ' + welcomeEnabled ? '_ON_' : '_OFF_' + '\nAnd, are displaying in this channel: <#' + welcomeChannel + '>';
						return msg.embed(welcomeEmbed);
					});
				}
			}
			case 'enable': {
				if (welcomeEnabled === false) {
					return msg.client.provider.set(msg.guild, 'welcomeEnabled', true).then(() => {
						welcomeEmbed.description = `Welcome message enabled.\nWelcome channel set to: <#${welcomeChannel}>\nWelcome message set to: ${welcomeMessage}`;
						return msg.embed(welcomeEmbed);
					}).catch(() => {
						welcomeEmbed.description = 'There was an error processing the request.';
						return msg.embed(welcomeEmbed);
					});
				} else {
					welcomeEmbed.description = 'Welcome message is already enabled! Disable with `welcome disable`';
					return msg.embed(welcomeEmbed);
				}
			}
			case 'disable': {
				if (welcomeEnabled === true) {
					return msg.client.provider.set(msg.guild, 'welcomeEnabled', false).then(() => {
						welcomeEmbed.description = `Welcome message disabled.\nWelcome channel set to: <#${welcomeChannel}>\nWelcome message set to: ${welcomeMessage}`;
						return msg.embed(welcomeEmbed);
					}).catch(() => {
						welcomeEmbed.description = 'There was an error processing the request.';
						return msg.embed(welcomeEmbed);
					});
				} else {
					welcomeEmbed.description = 'Welcome message is already disabled! Enable with `welcome enable`';
					return msg.embed(welcomeEmbed);
				}
			}
			default: {
				welcomeEmbed.description = 'Invalid subcommand. Please see `help welcome`.';
				return msg.embed(welcomeEmbed);
			}
		}
	}
}
