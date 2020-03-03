/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Colors, Event, EventStore } from 'klasa';
import { SpudConfig } from '@lib/config';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { once: true });
	}

	public async run() {
		this.client.emit('verbose', new Colors({ text: 'magenta' }).format(`Logged into Discord! Serving in ${this.client.guilds.array().length} Discord servers`));
		this.client.emit('verbose', new Colors({ text: 'blue' }).format('---Spudnik Launch Success---'));
		this.client.emit('verbose', `Successfully initialized. Ready to serve ${this.client.guilds.size} guild${this.client.guilds.size === 1 ? '' : 's'}.`);

		await this.initBotListUpdateTask().catch(error => this.client.emit('wtf', error));
		await this.initStatusUpdateTask().catch(error => this.client.emit('wtf', error));
	}

	private async initBotListUpdateTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some(task => task.taskName === 'botlists')) {
			await this.client.schedule.create('botlists', SpudConfig.botListUpdateInterval, {});
		}
	}

	private async initStatusUpdateTask() {
		const { tasks } = this.client.schedule;
		if (!tasks.some(task => task.taskName === 'status')) {
			await this.client.schedule.create('status', SpudConfig.statusUpdateInterval, {});
		}
	}

}
