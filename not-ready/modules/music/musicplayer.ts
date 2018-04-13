import { Message, MessageEmbed, VoiceChannel, VoiceConnection } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';

// tslint:disable-next-line:no-var-requires
const { defaultEmbedColor }: { defaultEmbedColor: string } = require('../../../config/config.json');

export default class MusicCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Used to play music. Supports YouTube and many others: <http://rg3.github.io/youtube-dl/supportedsites.html>',
			details: 'play <search terms|URL>|queue|dequeue <index>|skip|stop',
			group: 'music',
			guildOnly: true,
			memberName: 'music',
			name: 'music',
			args: [
				{
					key: 'subCommand',
					prompt: 'play|stop|skip|queue|dequeue\n',
					type: 'string',
				},
				{
					default: '',
					key: 'item',
					prompt: 'what track, index, or number do you want?\n',
					type: 'string',
				},
			],
		});
	}
	public async run(msg: CommandMessage, args: { subCommand: string, item: string }): Promise<Message | Message[]> {
		const MAX_QUEUE_SIZE = 20;
		let item = args.item;

		function getQueue(server: string) {
			const { queue } = msg.client.provider.get(server, 'musicQueue', { queue: [] });
			return queue;
		}
		function executeQueue(msg: CommandMessage, queue: any) {
			// If the queue is empty, finish.
			if (queue.length === 0) {
				msg.channel.send(createTextEmbed('Playback finished.'));

				// Leave the voice channel.
				const voiceConnection = msg.client.voiceConnections.get(msg.guild.id);
				if (voiceConnection !== undefined) {
					voiceConnection.disconnect();
					return;
				}
			}

			new Promise((resolve, reject) => {
				// Join the voice channel if not already in one.
				const voiceConnection = msg.client.voiceConnections.get(msg.guild.id);

				if (voiceConnection === null) {
					// Check if the user is in a voice channel.
					const voiceChannel = getAuthorVoiceChannel(msg);

					if (voiceChannel !== undefined) {
						voiceChannel.join().then((connection) => {
							resolve(connection);
						}).catch(console.error);
					} else {
						// Otherwise, clear the queue and do nothing.
						queue.splice(0, queue.length);
						reject();
					}
				} else {
					resolve(voiceConnection);
				}
			}).then((connection) => {
				if (connection instanceof VoiceConnection) {
					// Get the first item in the queue.
					const video = queue[0];

					// Play the video.
					msg.channel.send(createSongEmbed(video.title, video.webpage_url, video.thumbnail)).then(() => {
						let dispatcher;
						if (video.is_live === true) {
							dispatcher = connection.play(require('m3u8stream')(video.url));
						} else {
							dispatcher = connection.play(require('youtube-dl')(video.url, ['-q', '--no-warnings', '--force-ipv4']));
						}

						dispatcher.on('debug', (i: string) => console.log(`debug: ${i}`));
						// Catch errors in the connection.
						dispatcher.on('error', (err: Error) => {
							msg.channel.send(`fail: ${err}`);
							// Skip to the next song.
							queue.shift();
							executeQueue(msg, queue);
						});

						// Catch the end event.
						dispatcher.on('end', () => {
							// Wait a second.
							setTimeout(() => {
								// Remove the song from the queue.
								queue.shift();

								// Play the next song in the queue.
								executeQueue(msg, queue);
							}, 1000);
						});
					}).catch(console.error);
				}
			}).catch(console.error);
		}
		function getAuthorVoiceChannel(msg: CommandMessage): VoiceChannel {
			return msg.member.voiceChannel;
		}
		function createSongEmbed(text: string, link: string, thumbnail: string) {
			return new MessageEmbed({
				color: 5592405,
				author: {
					name: 'Music Player',
					icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/twitter/103/multiple-musical-notes_1f3b6.png',
				},
				footer: {
					text: 'powered by youtube-dl and m3u8stream',
				},
				description: `${text}\n\n${link}`,
				thumbnail: {
					url: thumbnail,
				},
			});
		}
		function createTextEmbed(text: string) {
			return new MessageEmbed({
				color: 5592405,
				author: {
					name: 'Music Player',
					icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/twitter/103/multiple-musical-notes_1f3b6.png',
				},
				footer: {
					text: 'powered by youtube-dl and m3u8stream',
				},
				description: text,
			});
		}

		switch (args.subCommand.toLowerCase()) {
			case 'play': {
				const voiceChannel: VoiceChannel = msg.member.voiceChannel;
				// Make sure the user is in a voice channel.
				if (voiceChannel === undefined) {
					return msg.embed(createTextEmbed("You're not in a voice channel."));
				}

				// Check for a video.
				if (item === '') {
					return msg.embed(createTextEmbed('No video specified!'));
				}

				// Get the queue.
				let queue = getQueue(msg.guild.id);

				// Check if the queue has reached its maximum size.
				if (queue.length >= MAX_QUEUE_SIZE) {
					return msg.embed(createTextEmbed('Maximum queue size reached!'));
				}

				// Get the video information.
				msg.embed(createTextEmbed('Searching...')).then((response) => {
					// If the suffix doesn't start with 'http', assume it's a search.
					if (!item.toLowerCase().startsWith('http')) {
						item = `gvsearch1:${item}`;
					}

					// Get the video info from youtube-dl.
					require('youtube-dl').getInfo(item, ['-q', '--no-warnings', '--force-ipv4'], (err: Error, info: any) => {
						// Verify the info.
						if (response instanceof Message) {
							if (err || info.format_id === undefined || info.format_id.startsWith('0')) {
								response.edit(createTextEmbed('Invalid video!'));
							}

							// Queue the video.
							response.edit(createTextEmbed(`Queued: ${info.title}`)).then((resp) => {
								let currentQueue = getQueue(msg.guild.id);
								currentQueue.push(info);
								msg.client.provider.set(msg.guild.id, 'musicQueue', currentQueue);
								queue = getQueue(msg.guild.id);

								// Play if only one element in the queue.
								if (queue.length === 1) {
									executeQueue(msg, queue);
									resp.delete({ timeout: 1000 });
								}
							}).catch((error: Error) => {
								console.error(error);
							});
						}
					});
				}).catch((error: Error) => {
					console.error(error);
				});
			}
			case 'queue': {
				// Get the queue.
				const queue = getQueue(msg.guild.id);

				// Get the queue text.
				const text = queue.map((video: any, index: number) => (`${(index + 1)}: ${video.title}`)).join('\n');

				// Get the status of the queue.
				let queueStatus = 'Stopped';
				const voiceConnection = msg.client.voiceConnections.get(msg.guild.id);
				if (voiceConnection !== null && voiceConnection !== undefined) {
					queueStatus = 'Playing';
				}

				// Send the queue and status.
				return msg.embed(createTextEmbed(`Queue (${queueStatus}):\n${text}`));
			}
			case 'dequeue': {
				let item = args.item;
				// Define a usage string to print out on errors
				const usageString = `The format is "!dequeue <index>". Use !queue to find the indices of each song in the queue.`;

				// Get the queue.
				const queue = getQueue(msg.guild.id);

				// Make sure the suffix exists.
				if (!item) {
					return msg.embed(createTextEmbed(`You need to specify an index to remove from the queue. ${usageString}`));
				}

				// Remove the index
				let index = parseInt(item, 10);
				let songRemoved = ''; // To be filled out below
				if (!isNaN(index)) {
					index--;

					if (index >= 0 && index < queue.length) {
						songRemoved = queue[index].title;

						if (index === 0) {
							// If it was the first one, skip it
							const voiceConnection = msg.client.voiceConnections.get(msg.guild.id);
							if (voiceConnection !== undefined) {
								voiceConnection.disconnect();
								msg.client.provider.remove(msg.guild.id, 'musicQueue');
							}
						} else {
							// Otherwise, just remove it from the queue
							queue.splice(index, 1);
							msg.client.provider.set(msg.guild.id, 'musicQueue', queue);
						}
					} else {
						return msg.embed(createTextEmbed(`The index is out of range. ${usageString}`));
					}
				} else {
					return msg.embed(createTextEmbed(`That index isn't a number. ${usageString}`));
				}

				// Send the queue and status.
				return msg.embed(createTextEmbed(`Removed '${songRemoved}' (index ${item}) from the queue.`));
			}
			case 'skip': {
				let item = args.item;
				// Get the voice connection.
				const voiceConnection = msg.client.voiceConnections.get(msg.guild.id);
				if (voiceConnection === null || voiceConnection === undefined) {
					return msg.embed(createTextEmbed('No music being played.'));
				}

				// Get the queue.
				const queue = getQueue(msg.guild.id);

				if (queue.length < 1) {
					return msg.embed(createTextEmbed('No music is in the queue.'));
				}

				// Get the number to skip.
				let toSkip = 1; // Default 1.
				if (parseInt(item, 10) > 0) {
					toSkip = parseInt(item, 10);
				}
				toSkip = Math.min(toSkip, queue.length);

				// Skip.
				queue.splice(0, toSkip - 1);
				msg.client.provider.set(msg.guild.id, 'musicQueue', queue);

				return msg.embed(createTextEmbed(`Skipped ${toSkip}!`));
			}
			case 'stop': {
				const voiceConnection = msg.client.voiceConnections.get(msg.guild.id);
				// Clear Queue
				msg.client.provider.remove(msg.guild.id, 'musicQueue');

				// Disconnect Voice
				if (voiceConnection !== undefined) {
					voiceConnection.disconnect();
					return msg.embed(createTextEmbed('Playback Stopped.'));
				}
			}
			default: {
				return msg.embed(createTextEmbed('Invalid subcommand. Please see `help music`.'));
			}
		}
	}
}
