/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Task, Colors } from 'klasa';
import { Guild, PresenceData, Presence } from 'discord.js';
import { createPick } from '@lib//utils/util';

export default class extends Task {

	public run(): Promise<Presence> {
		this.client.emit('log', new Colors({ text: 'lightblue' }).format('[STATUS UPDATE]'));

		const defaultPrefix = this.client.options.prefix;
		const guildCount = this.client.guilds.array().length;
		let userCount = this.client.guilds.map((guild: Guild) => guild.memberCount).reduce((a: number, b: number): number => a + b).toString();

		if (parseInt(userCount, 10) > 10000) {
			userCount = `${(Math.round(parseInt(userCount, 10) / 1000)).toString()}k`;
		}

		const statuses = createPick<PresenceData>([
			{
				activity: {
					name: `${defaultPrefix}help | ${guildCount} Servers`,
					type: 'PLAYING'
				}
			},
			{
				activity: {
					name: 'spudnik.io',
					type: 'PLAYING'
				}
			},
			{
				activity: {
					name: `${defaultPrefix}donate 💕`,
					type: 'PLAYING'
				}
			},
			{
				activity: {
					name: `Version: v${process.env.npm_package_version} | ${defaultPrefix}help`,
					type: 'PLAYING'
				}
			},
			{
				activity: {
					name: `spudnik.io/support | ${defaultPrefix}support`,
					type: 'PLAYING'
				}
			},
			{
				activity: {
					name: `and Assisting ${userCount} users.`,
					type: 'WATCHING'
				}
			},
			{
				activity: {
					name: `${defaultPrefix}upvote 👍`,
					type: 'PLAYING'
				}
			},
			{
				activity: {
					name: 'docs.spudnik.io',
					type: 'PLAYING'
				}
			},
			{
				activity: {
					name: `${defaultPrefix}changelog 📜`
				}
			},
			{
				activity: {
					name: `and Assisting ${guildCount} servers.`,
					type: 'WATCHING'
				}
			},
			{
				activity: {
					name: 'For the Motherland!',
					type: 'PLAYING'
				}
			},
			{
				activity: {
					name: '!feedback 😠😍',
					type: 'PLAYING'
				}
			}
		]);

		return this.client.user.setPresence(statuses());
	}

	public init(): Promise<Presence> {
		return this.run();
	}

}
