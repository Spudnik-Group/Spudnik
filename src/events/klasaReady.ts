/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Colors, Event, EventStore, ScheduledTask } from 'klasa';
import { SpudConfig } from '@lib/config';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { once: true });
	}

	public async run(): Promise<void> {
		this.client.emit('verbose', new Colors({ text: 'blue' }).format('---Spudnik MECO---'));

		await this.initBotListUpdateTask().catch((error: Error) => this.client.emit('wtf', error));
		await this.initStatusUpdateTask().catch((error: Error) => this.client.emit('wtf', error));
	}

	private async initBotListUpdateTask(): Promise<void> {
		const { tasks } = this.client.schedule;
		if (!tasks.some((task: ScheduledTask) => task.taskName === 'botlists')) {
			await this.client.schedule.create('botlists', SpudConfig.botListUpdateInterval, {});
		}
	}

	private async initStatusUpdateTask(): Promise<void> {
		const { tasks } = this.client.schedule;
		if (!tasks.some((task: ScheduledTask) => task.taskName === 'status')) {
			await this.client.schedule.create('status', SpudConfig.statusUpdateInterval, {});
		}
	}

}
