import { Message, MessageEmbed } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';

const botlistGuilds: string[] = process.env.spud_botlist_guilds ? process.env.spud_botlist_guilds.split(',') : [];

export const handleMessage = async(message: Message, client: CommandoClient) => {
	if (message.guild) {
		if (botlistGuilds.includes(message.guild.id)) { return; } //Guild is on Blacklist, ignore.
		if (client.provider.get(message.guild.id, 'adblockEnabled', false)) {
			if (message.content.search(/(discord\.gg\/.+|discordapp\.com\/invite\/.+)/i) !== -1) {
				message.delete();
				const rejectMessage: Message | Message[] = await message.channel.send({
					embed: new MessageEmbed()
						.setAuthor('🛑 Adblock')
						.setDescription('Only mods may paste invites to other servers!')
				});
				if (rejectMessage instanceof Message) {
					if (rejectMessage.deletable) {
						rejectMessage.delete({ timeout: 3000 });
					}
				};
			}
		}
	}
}
