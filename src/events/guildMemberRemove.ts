import { Event } from 'klasa';
import { SpudConfig } from '../lib/config/spud-config';
import { TextChannel, GuildMember, Guild } from 'discord.js';

export default class extends Event {

    async run(member: GuildMember) {
        const guild: Guild = member.guild;
        if (SpudConfig.botListGuilds.includes(guild.id)) { return; } //Guild is on Blacklist, ignore.
        const goodbyeEnabled = await guild.settings.get('goodbye.enabled');
        const goodbyeChannel = await guild.settings.get('goodbye.channel');

        if (goodbyeEnabled && goodbyeChannel) {
            const goodbyeMessage = await guild.settings.get('goodbye.message');
            const message = goodbyeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}> (${member.user.tag})`);
            const channel = guild.channels.get(goodbyeChannel);

            if (channel) {
                (channel as TextChannel).send(message);
            } else {
                this.client.emit('warn', `There was an error trying to say goodbye a former guild member in ${guild}, the channel may not exist or was set to a non-text channel`);
            }
        }
    }

};
