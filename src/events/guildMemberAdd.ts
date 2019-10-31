import { Event } from 'klasa';
import { SpudConfig } from '../lib/config/spud-config';
import { TextChannel } from 'discord.js';

export default class extends Event {

    run(member) {
        const guild = member.guild;
        if (SpudConfig.botListGuilds.includes(guild.id)) { return; } //Guild is on Blacklist, ignore.
        const welcomeEnabled = this.client.settings.get('welcomeEnabled');
        const welcomeChannel = this.client.settings.get('welcomeChannel');

        if (welcomeEnabled && welcomeChannel) {
            const welcomeMessage = this.client.settings.get('welcomeMessage');
            const message = welcomeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}>`);
            const channel = guild.channels.get(welcomeChannel);

            if (channel && channel.type === 'text') {
                (channel as TextChannel).send(message);
            } else {
                this.client.emit('warn', `There was an error trying to welcome a new guild member in ${guild}, the channel may no longer exist or was set to a non-text channel`);
            }
        }
    }

};
