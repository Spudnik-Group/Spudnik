import chalk from 'chalk';
import { Channel, Guild, GuildChannel, GuildMember, Message, MessageAttachment, MessageEmbed, MessageReaction, PresenceData, TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import * as http from 'http';
import Mongoose = require('mongoose');
import * as path from 'path';
import * as Rollbar from 'rollbar';
import { Configuration } from './config';
import { MongoProvider } from './providers/mongodb-provider';

// tslint:disable:no-var-requires
const { version }: { version: string } = require('../../package');
// tslint:enable:no-var-requires
const PORT = process.env.PORT || 1337;
const starboardGuildBlacklist: string[] = JSON.parse(process.env.STARBOARD_GUILD_BLACKLIST) || [];

/**
 * The Spudnik Discord Bot.
 *
 * @export
 * @class Spudnik
 */
export class Spudnik {
	public Config: Configuration;
	public Discord: CommandoClient;
	private Rollbar: any;

	/**
	 * Creates an instance of Spudnik.
	 *
	 * @param {Configuration} config
	 * @memberof Spudnik
	 */
	constructor(config: Configuration) {
		this.Config = config;

		console.log(chalk.blue('---Spudnik Stage 2 Engaged.---'));

		this.Rollbar = new Rollbar({
			accessToken: this.Config.getRbApiKey(),
			captureUncaught: true,
			captureUnhandledRejections: true,
			environment: process.env.NODE_ENV
		});

		this.Discord = new CommandoClient({
			commandPrefix: '!',
			invite: 'https://spudnik.io/support',
			messageCacheLifetime: 30,
			messageSweepInterval: 60,
			owner: this.Config.getOwner(),
			unknownCommandResponse: false
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
				['util', 'Utility']
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
			Mongoose.connect(this.Config.getDatabaseConnection(), { useMongoClient: true }).then(() => new MongoProvider(Mongoose.connection))
		).catch((err) => {
			this.Rollbar.critical(err);
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
			.once('ready', async () => {
				const users: number = this.Discord.guilds.map((guild: Guild) => guild.memberCount).reduce((a: number, b: number): number => a + b);
				const guilds: number = this.Discord.guilds.array().length;
				const statuses: PresenceData[] = [
					{
						activity: {
							name: `${this.Discord.commandPrefix}help | ${guilds} Servers`,
							type: 'PLAYING'
						}
					},
					{
						activity: {
							name: 'spudnik.io',
							type: 'STREAMING'
						}
					},
					{
						activity: {
							name: `${this.Discord.commandPrefix}donate 💕`,
							type: 'PLAYING'
						}
					},
					{
						activity: {
							name: `Version: v${version} | ${this.Discord.commandPrefix}help`,
							type: 'STREAMING'
						}
					},
					{
						activity: {
							name: `spudnik.io/support | ${this.Discord.commandPrefix}support`,
							type: 'PLAYING'
						}
					},
					{
						activity: {
							name: 'docs.spudnik.io',
							type: 'STREAMING'
						}
					},
					{
						activity: {
							name: `and Assisting ${users} users on ${guilds} servers`,
							type: 'WATCHING'
						}
					},
					{
						activity: {
							name: 'For the Motherland!',
							type: 'PLAYING'
						}
					}
				];

				console.log(chalk.magenta(`Logged into Discord! Serving in ${guilds} Discord servers`));
				console.log(chalk.blue('---Spudnik Launch Success---'));

				// Update bot status, using array of possible statuses
				let statusIndex: number = -1;
				statusIndex = this.updateStatus(this.Discord, statuses, statusIndex);
				setInterval(() => statusIndex = this.updateStatus(this.Discord, statuses, statusIndex), this.Config.getBotListUpdateInterval(), true);
				setInterval(() => this.updateStatusStats(this.Config, this.Discord, statuses), this.Config.getBotListUpdateInterval(), true);

				// TODO: Cleanup for old starboard code, remove this in later version
				this.Discord.guilds.each(guild => {
					this.Discord.provider.remove(guild.id, 'starboard');
				});
			})
			.on('raw', async (event: any) => {
				if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(event.t)) { return; } //Ignore non-emoji related actions
				const { d: data } = event;
				const channel: Channel = await this.Discord.channels.get(data.channel_id);
				if (starboardGuildBlacklist.includes((channel as TextChannel).guild.id)) { return; } //Guild is on Blacklist, ignore.
				if ((channel as TextChannel).nsfw) { return; } //Ignore NSFW channels
				if (!(channel as TextChannel).permissionsFor(this.Discord.user.id).has('READ_MESSAGE_HISTORY')) { return; } //Bot doesn't have the right permissions
				const message: Message = await (channel as TextChannel).messages.fetch(data.message_id);
				const starboardEnabled: boolean = await this.Discord.provider.get(message.guild.id, 'starboardEnabled', false);
				if (!starboardEnabled) { return; } //Ignore if starboard isn't set up
				const starboardChannel = await this.Discord.provider.get(message.guild.id, 'starboardChannel');
				const starboard: GuildChannel = await message.guild.channels.get(starboardChannel);
				if (starboard === undefined) { return; } //Ignore if starboard isn't set up
				if (starboard === channel) { return; } //Can't star items in starboard channel
				const emojiKey: any = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
				const reaction: MessageReaction = message.reactions.get(emojiKey);
				const starred = await (starboard as TextChannel).messages.fetch({ limit: 100 });
				const starboardTrigger: string = await this.Discord.provider.get(message.guild.id, 'starboardTrigger', '⭐');

				// If all emojis were removed from this message, check if message is in the starboard
				if (!reaction) {
					if (starred.some((star) => star.id === message.id)) {
						// Remove from the starboard
						const starredMsg = await starred.find((msg) => msg.id === message.id);
						const starredEmbed = await (starboard as TextChannel).messages.fetch(starredMsg.id);
						if (starredEmbed) {
							return starredEmbed.delete();
						}
						return;
					}
					return;
				}

				// Check for starboard reaction
				if (starboardTrigger === (reaction as MessageReaction).emoji.name) {
					const stars = await message.reactions.find((mReaction: MessageReaction) => mReaction.emoji.name === starboardTrigger).users.fetch();
					const starboardEmbed: MessageEmbed = new MessageEmbed()
						.setAuthor(message.guild.name, message.guild.iconURL())
						.setThumbnail(message.author.displayAvatarURL())
						.addField('Author', message.author.toString(), true)
						.addField('Channel', (channel as TextChannel).toString(), true)
						.setColor(await this.Discord.provider.get(message.guild.id, 'embedColor', 5592405))
						.setTimestamp()
						.setFooter(`⭐ ${stars.size} | ${message.id} `);

					// You can't star your own messages
					if (message.author.id === data.user_id && !this.Discord.owners.includes(data.user_id)) {
						return (channel as TextChannel)
							.send(`⚠ You cannot star your own messages, **<@${data.user_id}>**!`)
							.then((reply: Message | Message[]) => {
								if (reply instanceof Message) {
									reply.delete({ timeout: 3000 }).catch(() => undefined);
								}
							});
					}
					// You can't star bot messages
					if (message.author.bot) {
						return (channel as TextChannel)
							.send(`⚠ You cannot star bot messages, **<@${data.user_id}>**!`)
							.then((reply: Message | Message[]) => {
								if (reply instanceof Message) {
									reply.delete({ timeout: 3000 }).catch(() => undefined);
								}
							});
					}
					if (message.content.length > 1) { starboardEmbed.addField('Message', message.content); } // Add message
					if (message.attachments.size > 0) {
						starboardEmbed.setImage((message.attachments as any).first().attachment); // Add attachments
					}

					// Check for presence of post in starboard channel
					if (starred.some((star) => star.embeds[0].footer.text.startsWith(starboardTrigger) && star.embeds[0].footer.text.endsWith(message.id))) {
						// Old star, update star count
						const starredMsg = await starred.find((msg) => msg.id === message.id && msg.channel.id === (channel as TextChannel).id);
						const starredEmbed = await (starboard as TextChannel).messages.fetch(starredMsg.id);
						if (starredEmbed) {
							starredEmbed.edit({ embed: starboardEmbed })
								.catch((err) => {
									this.Discord.emit('warn', err);
									(starboard as TextChannel).send(`Failed to send embed of message ID: ${message.id}`);
								});
						}
					} else {
						// Fresh star, add to starboard
						(starboard as TextChannel).send({ embed: starboardEmbed })
							.catch((err) => {
								this.Discord.emit('warn', err);
								(starboard as TextChannel).send(`Failed to send embed of message ID: ${message.id}`);
							});
					}
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
									.setDescription('Only mods may paste invites to other servers!')
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
				const welcomeEnabled = this.Discord.provider.get(guild, 'welcomeEnabled', false);
				const welcomeChannel = this.Discord.provider.get(guild, 'welcomeChannel');

				if (welcomeEnabled && welcomeChannel) {
					const welcomeMessage = this.Discord.provider.get(guild, 'welcomeMessage', '@here, please Welcome {user} to {guild}!');
					const message = welcomeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}>`);
					const channel = guild.channels.get(welcomeChannel);
					if (channel && channel.type === 'text') {
						(channel as TextChannel).send(message);
					} else {
						this.Discord.emit('error', `There was an error trying to welcome a new guild member in ${guild}, the channel may no longer exist or was set to a non-text channel`);
					}
				}
			})
			.on('guildMemberRemove', (member: GuildMember) => {
				const guild = member.guild;
				const goodbyeEnabled = this.Discord.provider.get(guild, 'goodbyeEnabled', false);
				const goodbyeChannel = this.Discord.provider.get(guild, 'goodbyeChannel');

				if (goodbyeEnabled && goodbyeChannel) {
					const goodbyeMessage = this.Discord.provider.get(guild, 'goodbyeMessage', '{user} has left the server.');
					const message = goodbyeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}> (${member.user.tag})`);
					const channel = guild.channels.get(goodbyeChannel);
					if (channel && channel.type === 'text') {
						(channel as TextChannel).send(message);
					} else {
						this.Discord.emit('error', `There was an error trying to say goodbye a former guild member in ${guild}, the channel may not exist or was set to a non-text channel`);
					}
				}
			})
			.on('disconnected', (err: Error) => {
				this.Rollbar.critical(`Disconnected from Discord!\nError: ${err}`);
				console.log(chalk.red('Disconnected from Discord!'));
				process.exit();
			})
			.on('error', (err: Error) => {
				this.Rollbar.error(err);
				console.error(err);
			})
			.on('warn', (err: Error) => {
				this.Rollbar.warn(err);
				console.warn(err);
			})
			.on('debug', (err: Error) => {
				if (this.Config.getDebug()) {
					console.info(err);
				}
			})
			.on('commandError', (cmd, err) => {
				if (this.Config.getDebug()) {
					console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
				}
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
		}).listen(PORT);

		// Print URL for accessing server
		console.log(`Heartbeat running on port ${PORT}`);
	}

	/**
	 * Updates discord bot list stats and status messages on interval
	 *
	 * @private
	 * @memberof Spudnik
	 */
	private updateStatusStats = (config: Configuration, client: CommandoClient, statuses: PresenceData[]): PresenceData[] => {
		const users: number = client.guilds.map((guild: Guild) => guild.memberCount).reduce((a: number, b: number): number => a + b);
		const guilds: number = client.guilds.array().length;

		// Update Statuses
		statuses = statuses.filter((item: PresenceData) => {
			if (item.activity && item.activity.type !== 'WATCHING') {
				return true;
			}
			return false;
		});

		statuses.push({
			activity: {
				name: `and Assisting ${users} users on ${guilds} servers`,
				type: 'WATCHING'
			}
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
