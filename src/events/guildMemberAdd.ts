/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';
import { SpudConfig } from '../lib/config/spud-config';
import { TextChannel, GuildMember, Guild } from 'discord.js';

export default class extends Event {

    async run(member: GuildMember) {
        const guild: Guild = member.guild;
        if (SpudConfig.botListGuilds.includes(guild.id)) { return; } //Guild is on Blacklist, ignore.
        const welcomeEnabled = await guild.settings.get('welcome.enabled');
        const welcomeChannel = await guild.settings.get('welcome.channel');

        if (welcomeEnabled && welcomeChannel) {
            const welcomeMessage = await guild.settings.get('welcome.message');
            const message = welcomeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}>`);
            const channel = guild.channels.get(welcomeChannel);

            if (channel) {
                (channel as TextChannel).send(message);
            } else {
                this.client.emit('warn', `There was an error trying to welcome a new guild member in ${guild}, the channel may no longer exist or was set to a non-text channel`);
            }
        }
    }

};
