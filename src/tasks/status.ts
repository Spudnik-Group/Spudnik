/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Task, Colors } from 'klasa';
import { Guild, PresenceData } from 'discord.js';
import { createPick } from '../lib/utils/util';
const { version }: { version: string } = require('../../package');

export default class extends Task {

    public async run() {
        this.client.emit('verbose', new Colors({ text: 'lightblue' }).format('[STATUS UPDATE]'));

        const statuses = createPick<PresenceData>([
            {
                activity: {
                    name: `${this.client.options.prefix}help | ${this.client.guilds.array().length} Servers`,
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
                    name: `${this.client.options.prefix}donate 💕`,
                    type: 'PLAYING'
                }
            },
            {
                activity: {
                    name: `Version: v${version} | ${this.client.options.prefix}help`,
                    type: 'PLAYING'
                }
            },
            {
                activity: {
                    name: `spudnik.io/support | ${this.client.options.prefix}support`,
                    type: 'PLAYING'
                }
            },
            {
                activity: {
                    name: `and Assisting ${(Math.round((this.client.guilds.map((guild: Guild) => guild.memberCount).reduce((a: number, b: number): number => a + b)/1000) * 1000))} users.`,
                    type: 'WATCHING'
                }
            },
            {
                activity: {
                    name: `${this.client.options.prefix}upvote 👍`,
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
                    name: `${this.client.options.prefix}changelog 📜`
                }
            },
            {
                activity: {
                    name: `and Assisting ${this.client.guilds.array().length} servers.`,
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

        this.client.user.setPresence(statuses());
    }
    
};
