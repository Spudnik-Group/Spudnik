import { getEmbedColor } from '../../helpers/custom-helpers';
import { KlasaClient, CommandStore, Command, KlasaMessage } from 'klasa';

/**
 * Posts a message to the announcement channel of all the servers Spudnik is connected to.
 *
 * @export
 * @class BotAnnounceCommand
 * @extends {Command}
 */
export default class extends Command {
	/**
	 * Creates an instance of BotAnnounceCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof BotAnnounceCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['notify'],
			description: 'Posts a message to the announcement channel of all the servers Spudnik is connected to.',
			guarded: true,
			hidden: true,
			name: 'bot-announce',
            cooldown: 60,
            requiredSettings: ['channels.botAnnounceChannel', 'roles.announcementRole']
		});
	}

	/**
	 * Run the "BotAnnounceCommand" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ message: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof BotAnnounceCommand
	 */
	public async run(msg: KlasaMessage, [announcement]: any): Promise<KlasaMessage | KlasaMessage[]> {
		let guildModels = await this.client.providers.default.getAll('botAnnounceChannel');
        let announcementChannels = guildModels.filter(guildModel => guildModel.dataValues.botAnnounceChannel).map(guildModel => guildModel.dataValues.botAnnounceChannel);

        for (let channel of announcementChannels) {
            if (this.client.shard) {
                await this.client.shard.broadcastEval(`
                let channel = this.client.channels.get('${channel}');
                if (channel) {
                    channel.send({
                    embed: {
                        color: this.colors.BLUE,
                        description: \`${announcement}\`
                    }
                    }).catch(this.log.error);
                }
                `);
            }
            else {
                await msg.guild.channels.get(channel).send({
                    embed: {
                        color: getEmbedColor(msg),
                        description: announcement
                    }
                }).catch(() => {});
            }
        }
		
        return message.channel.send({
            embed: {
                color: Bastion.colors.GREEN,
                title: 'Announced',
                description: announcementMessage
            }
        }).catch(e => {
            
        });
	}
}
