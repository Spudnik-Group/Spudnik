import { Message, RichEmbed, TextChannel } from 'discord.js';
import { Spudnik } from '../spudnik';

module.exports = (Spudnik: Spudnik) => {
	let lastPruned = new Date().getTime() - (Spudnik.Config.getPruneInterval() * 1000);

	return {
		commands: [
			'ban',
			'kick',
			'prune',
			'topic',
		],
		ban: {
			usage: '<user> [days of messages to delete] [reason]',
			description: 'bans the user, optionally deleting messages from them in the last x days',
			process: (msg: Message, suffix: string) => {
				const args = suffix.split(' ');
				if (args.length > 0 && args[0]) {
					if (!msg.guild.me.hasPermission('BAN_MEMBERS')) {
						return Spudnik.processMessage(Spudnik.defaultEmbed("I don't have permission to ban people!"), msg, true, false);
					}

					if (!msg.member.hasPermission('BAN_MEMBERS')) {
						return Spudnik.processMessage(Spudnik.defaultEmbed(`You don't have permission to ban people, ${msg.member}!`), msg, true, false);
					}

					Spudnik.Discord.fetchUser(Spudnik.resolveMention(args[0])).then((member) => {
						if (member !== undefined) {
							if (msg.mentions.users.first() === member && !msg.mentions.members.first().bannable) {
								return Spudnik.processMessage(Spudnik.defaultEmbed(`I can't ban ${member}. Do they have the same or a higher role than me?`), msg, true, false);
							}
							if (args.length > 1) {
								if (!isNaN(parseInt(args[1], 10))) {
									if (args.length > 2) {
										const days = args[1];
										const reason = args.slice(2).join(' ');
										msg.guild.ban(member, { days: parseFloat(days), reason }).then(() => {
											return Spudnik.processMessage(Spudnik.defaultEmbed(`Banning ${member} from ${msg.guild} for ${reason}!`), msg, false, false);
										}).catch(() => {
											return Spudnik.processMessage(Spudnik.defaultEmbed(`Banning ${member} from ${msg.guild} failed!`), msg, true, false);
										});
									} else {
										const days = args[1];
										msg.guild.ban(member, { days: parseFloat(days) }).then(() => {
											return Spudnik.processMessage(Spudnik.defaultEmbed(`Banning ${member} from ${msg.guild}!`), msg, false, false);
										}).catch(() => {
											return Spudnik.processMessage(Spudnik.defaultEmbed(`Banning ${member} from ${msg.guild} failed!`), msg, true, false);
										});
									}
								} else {
									const reason = args.slice(1).join(' ');
									msg.guild.ban(member, { reason }).then(() => {
										return Spudnik.processMessage(Spudnik.defaultEmbed(`Banning ${member} from ${msg.guild} for ${reason}!`), msg, false, false);
									}).catch(() => {
										return Spudnik.processMessage(Spudnik.defaultEmbed(`Banning ${member} from ${msg.guild} failed!`), msg, true, false);
									});
								}
							} else {
								msg.guild.ban(member).then(() => {
									return Spudnik.processMessage(Spudnik.defaultEmbed(`Banning ${member} from ${msg.guild}!`), msg, false, false);
								}).catch(() => {
									return Spudnik.processMessage(Spudnik.defaultEmbed(`Banning ${member} from ${msg.guild} failed!`), msg, true, false);
								});
							}
						}
					}).catch(() => {
						return Spudnik.processMessage(Spudnik.defaultEmbed(`Cannot find a user by the nickname of ${args[0]}. Try using their snowflake.`), msg, false, false);
					});
				} else {
					return Spudnik.processMessage(Spudnik.defaultEmbed('You must specify a user to ban.'), msg, false, false);
				}
			},
		},
		kick: {
			usage: '<user> [reason]',
			description: 'Kick a user with an optional reason. Requires both the command user and the bot to have kick permission',
			process: (msg: Message, suffix: string) => {
				const args = suffix.split(' ');

				if (args.length > 0 && args[0]) {
					if (!msg.guild.me.hasPermission('KICK_MEMBERS')) {
						return Spudnik.processMessage(Spudnik.defaultEmbed("I don't have permission to kick people!"), msg, true, false);
					}

					if (!msg.member.hasPermission('KICK_MEMBERS')) {
						return Spudnik.processMessage(Spudnik.defaultEmbed(`You don't have permission to kick people!, ${msg.member}!`), msg, true, false);
					}

					const member = msg.mentions.members.first();

					if (member !== undefined) {
						if (!member.kickable) {
							return Spudnik.processMessage(Spudnik.defaultEmbed(`I can't kick ${member}. Do they have the same or a higher role than me?`), msg, false, false);
						}
						if (args.length > 1) {
							const reason = args.slice(1).join(' ');
							member.kick(reason).then(() => {
								return Spudnik.processMessage(Spudnik.defaultEmbed(`Kicking ${member} from ${msg.guild} for ${reason}!`), msg, false, false);
							}).catch(() => Spudnik.processMessage(Spudnik.defaultEmbed(`Kicking ${member} failed!`), msg, true, false));
						} else {
							member.kick().then(() => {
								return Spudnik.processMessage(Spudnik.defaultEmbed(`Kicking ${member} from ${msg.guild}!`), msg, false, false);
							}).catch(() => {
								Spudnik.processMessage(Spudnik.defaultEmbed(`Kicking ${member} failed!`), msg, true, false);
							});
						}
					} else {
						return Spudnik.processMessage(Spudnik.defaultEmbed(`I couldn't find a user ${args[0]}`), msg, false, false);
					}
				} else {
					return Spudnik.processMessage(Spudnik.defaultEmbed('You must specify a user to kick.'), msg, false, false);
				}
			},
		},
		prune: {
			usage: '<count|1-100>',
			process: (msg: Message, suffix: string) => {
				if (!suffix) {
					return Spudnik.processMessage(Spudnik.defaultEmbed('You must specify a number of messages to prune.'), msg, true, false);
				}

				if (!msg.guild.me.hasPermission('MANAGE_MESSAGES')) {
					return Spudnik.processMessage(Spudnik.defaultEmbed("I don't have permission to prune messages."), msg, true, false);
				}

				if (!msg.member.hasPermission('MANAGE_MESSAGES')) {
					return Spudnik.processMessage(Spudnik.defaultEmbed(`You don't have permission to prune messages, ${msg.member}!`), msg, true, false);
				}

				const timeSinceLastPrune = Math.floor(new Date().getTime() - lastPruned);

				if (timeSinceLastPrune > (Spudnik.Config.getPruneInterval() * 1000)) {
					if (!isNaN(parseInt(suffix, 10))) {
						let count = parseInt(suffix, 10);

						count++;

						if (count > Spudnik.Config.getPruneMax()) {
							count = Spudnik.Config.getPruneMax();
						}

						msg.channel.fetchMessages({ limit: count })
							.then((messages) => messages.map((m) => m.delete().catch((error: Error) => { console.error(error); })))
							.then(() => {
								return Spudnik.processMessage(Spudnik.defaultEmbed(`Pruning ${(count === 100) ? 100 : count - 1} messages...`), msg, true, false);
							});

						lastPruned = new Date().getTime();
					} else {
						return Spudnik.processMessage(Spudnik.defaultEmbed('I need a numerical value...'), msg, true, false);
					}
				} else {
					const wait = Math.floor(Spudnik.Config.getPruneInterval() - (timeSinceLastPrune / 1000));
					return Spudnik.processMessage(Spudnik.defaultEmbed(`You can't do that yet, please wait ${wait} second${wait > 1 ? 's' : ''}`), msg, true, false);
				}
			},
		},
		topic: {
			description: 'Shows the purpose of the chat channel',
			process: (msg: Message) => {
				const channel = msg.channel;
				let response = '';
				if (channel instanceof TextChannel) {
					response = channel.topic;
					if (channel.topic.trim() === '') {
						response = "There doesn't seem to be a topic for this channel. Maybe ask the mods?";
					}

					msg.channel.send(new RichEmbed({
						color: Spudnik.Config.getDefaultEmbedColor(),
						title: channel.name,
						description: response,
					}));
				}
			},
		},
	};
};
