import chalk from 'chalk';
import * as DBLAPI from 'dblapi.js';
import { Channel, Guild, GuildChannel, GuildMember, Message, MessageAttachment, MessageEmbed, MessageReaction, PresenceData, TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import * as http from 'http';
import Mongoose = require('mongoose');
import * as path from 'path';
import { Configuration } from './config';
import { MongoProvider } from './providers/mongodb-provider';

// tslint:disable:no-var-requires
const honeyBadger = require('honeybadger');
// tslint:enable:no-var-requires

/**
 * The Spudnik Discord Bot.
 *
 * @export
 * @class Spudnik
 */
export class Spudnik {
	public Config: Configuration;
	public Discord: CommandoClient;
	private Honeybadger: any;

	/**
	 * Creates an instance of Spudnik.
	 *
	 * @param {Configuration} config
	 * @memberof Spudnik
	 */
	constructor(config: Configuration) {
		this.Config = config;

		console.log(chalk.blue('---Spudnik Stage 2 Engaged.---'));

		this.Honeybadger = require('honeybadger').configure({
			apiKey: this.Config.getHbApiKey(),
		});

		this.Discord = new CommandoClient({
			commandPrefix: '!',
			messageCacheLifetime: 30,
			messageSweepInterval: 60,
			unknownCommandResponse: false,
			owner: this.Config.getOwner(),
			invite: 'https://spudnik.io/support',
		});

		this.setupCommands();
		this.setupEvents();
		this.setupDatabase();
		this.login();
		this.startHeart();

		console.log(chalk.blue('---Spudnik MECO---'));
	}

	/**
	 * Sets up commands for the bot.
	 *
	 * @private
	 * @memberof Spudnik
	 */
	private setupCommands = () => {
		this.Discord.registry
			.registerGroups([
				['custom', 'Custom'],
				['misc', 'Misc'],
				['mod', 'Moderation'],
				['random', 'Random'],
				['ref', 'Reference'],
				['roles', 'Roles'],
				['translate', 'Translate'],
				['util', 'Utility'],
			])
			.registerDefaults()
			.registerCommandsIn(path.join(__dirname, '../modules'));
	}

	/**
	 * Sets up the database.
	 *
	 * @private
	 * @memberof Spudnik
	 */
	private setupDatabase = () => {
		Mongoose.Promise = require('bluebird').Promise;

		this.Discord.setProvider(
			Mongoose.connect(this.Config.getDatabaseConnection(), { useMongoClient: true }).then(() => new MongoProvider(Mongoose.connection)),
		).catch((err) => {
			honeyBadger.notify(err);
			console.error(err);
			process.exit(-1);
		});
	}

	/**
	 * Sets up the bot events watchers.
	 *
	 * @private
	 * @memberof Spudnik
	 */
	private setupEvents = () => {
		this.Discord
			.once('ready', () => {
				// tslint:disable-next-line:no-var-requires
				const { version }: { version: string } = require('../../package');
				let statuses: PresenceData[] = [
					{
						activity: {
							type: 'PLAYING',
							name: `${this.Discord.commandPrefix}help | ${this.Discord.guilds.array().length} Servers`,
						},
					},
					{
						activity: {
							type: 'STREAMING',
							name: 'spudnik.io',
						}
					},
					{
						activity: {
							type: 'PLAYING',
							name: `${this.Discord.commandPrefix}donate 💕`,
						}
					},
					{
						activity: {
							type: 'STREAMING',
							name: `Version: v${version} | ${this.Discord.commandPrefix}help`,
						}
					},
					{
						activity: {
							type: 'PLAYING',
							name: `spudnik.io/support | ${this.Discord.commandPrefix}support`,
						}
					},
					{
						activity: {
							type: 'STREAMING',
							name: 'docs.spudnik.io',
						}
					},
				];

				console.log(chalk.magenta(`Logged into Discord! Serving in ${this.Discord.guilds.array().length} Discord servers`));
				console.log(chalk.blue('---Spudnik Launch Success---'));


				if (this.Config.getDblApiKey() !== '') {
					let upvotes: number = 0;
					let users = this.Discord.guilds.map((guild: Guild) => guild.memberCount).reduce((a: number, b: number): number => a + b);
					let guilds = this.Discord.guilds.values.length;

					let dbl: DBLAPI = new DBLAPI(this.Config.getDblApiKey(), this.Discord);

					dbl.getVotes().then((votes: DBLAPI.Vote[]) => {
						this.Discord.provider.set('0', 'dblUpvotes', votes.length);
						upvotes = votes.length;
					});

					statuses.push({
						activity: {
							type: 'WATCHING',
							name: `Upvoted ${upvotes} times on discordbots.org`,
						},
					});

					statuses.push({
						activity: {
							type: 'WATCHING',
							name: `Assisting ${users} users on ${guilds} servers`,
						},
					});

					// Bot Listing Interval Events
					this.updateDiscordBotList(this.Config, this.Discord, statuses);
					setInterval(() => statuses = this.updateDiscordBotList(this.Config, this.Discord, statuses), 1800000, true);
				}

				// Update bot status, using array of possible statuses
				let statusIndex: number = -1;
				statusIndex = this.updateStatus(this.Discord, statuses, statusIndex);
				setInterval(() => statusIndex = this.updateStatus(this.Discord, statuses, statusIndex), 30000, true);
			})
			.on('raw', async (event: any) => {
				if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(event.t)) {
					return;
				}

				const { d: data } = event;
				const channel: Channel | undefined = this.Discord.channels.get(data.channel_id);
				const message: Message = await (channel as TextChannel).messages.fetch(data.message_id);
				const emojiKey: any = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
				const reaction: MessageReaction | undefined = message.reactions.get(emojiKey);
				const starboardEnabled: boolean = await this.Discord.provider.get(message.guild.id, 'starboardEnabled', false);
				const starboard: GuildChannel | undefined = await message.guild.channels.get(this.Discord.provider.get(message.guild.id, 'starboardChannel'));
				const starboardTrigger = await this.Discord.provider.get(message.guild.id, 'starboardTrigger', '⭐');
				const starred: any[] = await this.Discord.provider.get(message.guild.id, 'starboard', []);
				const stars = await message.reactions.find((mReaction: MessageReaction) => mReaction.emoji.name === starboardTrigger).users.fetch();

				if (message.author.id === data.user_id && !this.Discord.owners.includes(data.user_id)) {
					return (channel as TextChannel)
						.send(`⚠ You cannot star your own messages, **<@${data.user_id}>**!`)
						.then((reply: Message | Message[]) => {
							if (reply instanceof Message) {
								reply.delete({ timeout: 3000 }).catch(() => undefined);
							}
						});
				}

				if ((channel as TextChannel).nsfw) {
					return;
				}

				if (starboardEnabled && starboard) {
					// Check for 'star' (or customized starboard reaction)
					if (starboardTrigger === (reaction as MessageReaction).emoji.name) {
						// Check for presence of post in starboard channel
						if (!starred.some((star: any) => star.messageId === message.id)) {
							// Fresh star, add to starboard and starboard tracking in DB
							(starboard as TextChannel).send({
								embed: new MessageEmbed()
									.setAuthor(message.guild.name, message.guild.iconURL())
									.setThumbnail(message.author.displayAvatarURL())
									.addField('Author', message.author.toString(), true)
									.addField('Channel', (channel as TextChannel).toString(), true)
									.addField('Message', !message.content.length ? '' : message.content, true)
									.setImage((message.attachments as any).filter((atchmt: MessageAttachment) => atchmt.attachment) ? (message.attachments as any).filter((atchmt: any) => atchmt.attachment).attachment : null)
									.setColor(await this.Discord.provider.get(message.guild.id, 'embedColor', 5592405))
									.setTimestamp()
									.setFooter(`⭐ ${stars.size} | ${message.id} `),
							}).then((item) => {
								starred.push({
									messageId: message.id,
									embedId: (item as Message).id,
									channelId: (channel as TextChannel).id,
								});
								this.Discord.provider.set(message.guild.id, 'starboard', starred);
							}).catch((err) => {
								(starboard as TextChannel).send(`Failed to send embed of message ID: ${message.id}`);
							});
						} else {
							// Old star, update star count
							const starredMsg = await starred.find((msg) => msg.messageId === message.id && msg.channelId === (channel as TextChannel).id);
							const starredEmbed = await (starboard as TextChannel).messages.fetch(starredMsg.embedId);
							if (starredEmbed) {
								starredEmbed.edit({
									embed: new MessageEmbed()
										.setAuthor(message.guild.name, message.guild.iconURL())
										.setThumbnail(message.author.displayAvatarURL())
										.addField('Author', message.author.toString(), true)
										.addField('Channel', (channel as TextChannel).toString(), true)
										.addField('Message', !message.content.length ? '' : message.content, true)
										.setImage((message.attachments as any).filter((atchmt: MessageAttachment) => atchmt.attachment) ? (message.attachments as any).filter((atchmt: any) => atchmt.attachment).attachment : null)
										.setColor(this.Discord.provider.get(message.guild.id, 'embedColor', 5592405))
										.setTimestamp()
										.setFooter(`⭐ ${stars.size} | ${message.id} `),
								}).catch((err) => {
									(starboard as TextChannel).send(`Failed to send embed of message ID: ${message.id}`);
								});
							}
						}
					}
				} else {
					return;
				}
			})
			.on('message', (message: Message) => {
				if (message.guild) {
					if (this.Discord.provider.get(message.guild.id, 'adblockEnabled', false)) {
						if (message.content.search(/(discord\.gg\/.+|discordapp\.com\/invite\/.+)/i) !== -1) {
							message.delete();
							message.channel.send({
								embed: new MessageEmbed()
									.setAuthor('🛑 Adblock')
									.setDescription('Only mods may paste invites to other servers!'),
							}).then((reply: Message | Message[]) => {
								if (reply instanceof Message) {
									reply.delete({ timeout: 3000 }).catch(() => undefined);
								}
							});
						}
					}
				}
			})
			.on('guildMemberAdd', (member: GuildMember) => {
				const guild = member.guild;
				const welcomeChannel = this.Discord.provider.get(guild, 'welcomeChannel', guild.systemChannelID);
				const welcomeMessage = this.Discord.provider.get(guild, 'welcomeMessage', '@here, please Welcome {user} to {guild}!');
				const welcomeEnabled = this.Discord.provider.get(guild, 'welcomeEnabled', false);

				if (welcomeEnabled) {
					const message = welcomeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}>`);
					const channel = guild.channels.get(welcomeChannel);
					if (channel && channel.type === 'text') {
						(channel as TextChannel).send(message);
					} else {
						this.Discord.emit('error', `There was an error trying to welcome a new guild member in ${guild}, the channel may not exist or was set to a non-text channel`);
					}
				}
			})
			.on('guildMemberRemove', (member: GuildMember) => {
				const guild = member.guild;
				const goodbyeChannel = this.Discord.provider.get(guild, 'goodbyeChannel', guild.systemChannelID);
				const goodbyeMessage = this.Discord.provider.get(guild, 'goodbyeMessage', '{user} has left the server.');
				const goodbyeEnabled = this.Discord.provider.get(guild, 'goodbyeEnabled', false);

				if (goodbyeEnabled) {
					const message = goodbyeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}>`);
					const channel = guild.channels.get(goodbyeChannel);
					if (channel && channel.type === 'text') {
						(channel as TextChannel).send(message);
					} else {
						this.Discord.emit('error', `There was an error trying to say goodbye a former guild member in ${guild}, the channel may not exist or was set to a non-text channel`);
					}
				}
			})
			.on('disconnected', (err: Error) => {
				honeyBadger.notify(chalk.red(`Disconnected from Discord!\nError: ${err}`));
				console.log(chalk.red('Disconnected from Discord!'));
			})
			.on('error', (err: Error) => {
				honeyBadger.notify(err);
				console.error(err);
			})
			.on('warn', (err: Error) => {
				honeyBadger.notify(err);
				console.warn(err);
			})
			.on('debug', (err: Error) => {
				if (this.Config.getDebug()) {
					console.info(err);
				}
			})
			.on('commandError', (cmd, err) => {
				honeyBadger.notify(err, { component: cmd.groupID, action: cmd.memberName });
				console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
			});
	}

	/**
	 * Log the bot into discord.
	 *
	 * @private
	 * @memberof Spudnik
	 */
	private login = () => {
		if (this.Config.getToken()) {
			console.log(chalk.magenta('Logging in to Discord...'));
			this.Discord.login(this.Config.getToken());
		} else {
			console.error('Spudnik must have a Discord bot token...');
			process.exit(-1);
		}
	}

	/**
	 * Starts heartbeat service.
	 *
	 * @private
	 * @memberof Spudnik
	 */
	private startHeart = () => {
		http.createServer((request, response) => {
			response.writeHead(200, { 'Content-Type': 'text/plain' });
			response.end('Ok!');
		}).listen(1337);

		// Print URL for accessing server
		console.log('Heartbeat running on port 1337');
	}

	/**
	 * Updates discord bot list stats and status messages on interval
	 *
	 * @private
	 * @memberof Spudnik
	 */
	private updateDiscordBotList = (config: Configuration, client: CommandoClient, statuses: PresenceData[]): PresenceData[] => {
		console.log(chalk.red('udbl'));
		const dbl: DBLAPI = new DBLAPI(config.getDblApiKey(), client);
		let upvotes: number = client.provider.get('0', 'dblUpvotes', 0);
		let users: number = client.guilds.map((guild: Guild) => guild.memberCount).reduce((a: number, b: number): number => a + b);
		let guilds: number = client.guilds.array().length;

		// Post stats
		dbl.postStats(client.guilds.array().length);

		// Update database with latest upvote count
		dbl.getVotes().then((votes: DBLAPI.Vote[]) => {
			client.provider.set('0', 'dblUpvotes', votes.length);
			upvotes = votes.length;
		});

		// Update Statuses
		statuses = statuses.filter((item: PresenceData) => {
			if (item.activity && item.activity.type !== 'WATCHING') {
				return true;
			}
			return false;
		});

		statuses.push({
			activity: {
				type: 'WATCHING',
				name: `Upvoted ${upvotes} times on discordbots.org`,
			},
		});

		statuses.push({
			activity: {
				type: 'WATCHING',
				name: `Assisting ${users} users on ${guilds} servers`,
			},
		});

		return statuses;
	}

	/**
	 * Updates bot status on interval
	 *
	 * @private
	 * @memberof Spudnik
	 */
	private updateStatus = (client: CommandoClient, statuses: PresenceData[], statusIndex: number): number => {
		++statusIndex;
		if (statusIndex >= statuses.length) {
			statusIndex = 0;
		}
		client.user.setPresence(statuses[statusIndex]);

		return statusIndex;
	}
}
