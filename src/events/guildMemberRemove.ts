import { Event } from 'klasa';
import { SpudConfig } from '../lib/config/spud-config';
import { TextChannel } from 'discord.js';

export default class extends Event {

    run(member) {
        const guild = member.guild;
        if (SpudConfig.botListGuilds.includes(guild.id)) { return; } //Guild is on Blacklist, ignore.
        const goodbyeEnabled = this.client.settings.get('goodbyeEnabled');
        const goodbyeChannel = this.client.settings.get('goodbyeChannel');

        if (goodbyeEnabled && goodbyeChannel) {
            const goodbyeMessage = this.client.settings.get('goodbyeMessage');
            const message = goodbyeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}> (${member.user.tag})`);
            const channel = guild.channels.get(goodbyeChannel);

            if (channel && channel.type === 'text') {
                (channel as TextChannel).send(message);
            } else {
                this.client.emit('warn', `There was an error trying to say goodbye a former guild member in ${guild}, the channel may not exist or was set to a non-text channel`);
            }
        }
    }

};
