/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Task, Colors } from 'klasa';
import axios from 'axios';
import { stripIndents } from 'common-tags';
import { SpudConfig } from '../lib/config';

export default class extends Task {

    public async run() {
        this.client.emit('verbose', new Colors({ text: 'lightblue' }).format('[BOTLIST UPDATE]'));

        try {
            // DISCORD.BOTS.gg
            if (SpudConfig.botsggApiKey) {
                await axios.post(`https://discord.bots.gg/api/v1/bots/${this.client.user.id}/stats`, { guildCount: Number(this.client.guilds.size) },
                    {
                        headers: { Authorization: SpudConfig.botsggApiKey }
                    })
                    .then(() => console.log('- Posted statistics successfully: discord.bots.gg'))
                    .catch((err) => console.log(stripIndents`- Failed to post statistics: discord.bots.gg
                        Error: ${err}
                    `))
            }

            // BOTS.ONDISCORD.xyz
            if (SpudConfig.bodApiKey) {
                await axios.post(`https://bots.ondiscord.xyz/bot-api/bots/${this.client.user.id}/guilds`, { guildCount: Number(this.client.guilds.size) },
                    {
                        headers: { Authorization: SpudConfig.bodApiKey }
                    })
                    .then(() => console.log('- Posted statistics successfully: bots.ondiscord.xyz'))
                    .catch((err) => console.log(stripIndents`- Failed to post statistics: bots.ondiscord.xyz
                        Error: ${err}
                    `))
            }

            // DISCORDBOTS.org
            if (SpudConfig.dbApiKey) {
                await axios.post(`https://discordbots.org/api/bots/${this.client.user.id}/stats`, { server_count: Number(this.client.guilds.size) },
                    {
                        headers: { Authorization: SpudConfig.dbApiKey }
                    })
                    .then(() => console.log('- Posted statistics successfully: discordbots.org'))
                    .catch((err) => console.log(stripIndents`- Failed to post statistics: discordbots.org
                        Error: ${err}
                    `))
            }

            // BOTSFORDISCORD.com
            if (SpudConfig.bfdApiKey) {
                await axios.post(`https://botsfordiscord.com/api/bot/${this.client.user.id}`, { server_count: Number(this.client.guilds.size) },
                    {
                        headers: { Authorization: SpudConfig.bfdApiKey }
                    })
                    .then(() => console.log('- Posted statistics successfully: botsfordiscord.com'))
                    .catch((err) => console.log(stripIndents`- Failed to post statistics: botsfordiscord.com
                        Error: ${err}
                    `))
            }

            // DISCORDBOTLIST.com
            if (SpudConfig.dblApiKey) {
                await axios.post(`https://discordbotlist.com/api/bots/${this.client.user.id}/stats`, { guilds: Number(this.client.guilds.size), users: Number(this.client.users.size) },
                    {
                        headers: { Authorization: `Bot ${SpudConfig.dblApiKey}` }
                    })
                    .then(() => console.log('- Posted statistics successfully: discordbotlist.com'))
                    .catch((err) => console.log(stripIndents`- Failed to post statistics: discordbotlist.com
                        Error: ${err}
                    `))
            }
        } catch(error) {
            this.client.emit('wtf', error);
        }
    }
    
};
