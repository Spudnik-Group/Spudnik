/* tslint:disable */
// import { Message } from 'discord.js';
// import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
// import { stripIndents } from 'common-tags';
// import * as format from 'date-fns/format';
// import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';

// /**
//  * Posts a message to the announcement channel of all the servers Spudnik is connected to.
//  *
//  * @export
//  * @class BotAnnounceCommand
//  * @extends {Command}
//  */
// export default class BotAnnounceCommand extends Command {
// 	/**
// 	 * Creates an instance of BotAnnounceCommand.
// 	 *
// 	 * @param {CommandoClient} client
// 	 * @memberof BotAnnounceCommand
// 	 */
// 	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
// 		super(client, store, file, directory, {
// 			aliases: ['notify'],
// 			args: [
// 				{
// 					key: 'message',
// 					label: 'Message',
// 					prompt: 'What message would you like to send?',
// 					type: 'string'
// 				}
// 			],
// 			description: 'Posts a message to the announcement channel of all the servers Spudnik is connected to.',
// 			details: stripIndents`
// 				Only the bot owner(s) may use this command.
// 			`,
// 			examples: ['bot-announce Some really cool features just launched!'],
// 			group: 'bot_owner',
// 			guarded: true,
// 			hidden: true,
// 			memberName: 'bot-announce',
// 			name: 'bot-announce',
// 			ownerOnly: true
// 		});
// 	}

// 	/**
// 	 * Run the "BotAnnounceCommand" command.
// 	 *
// 	 * @param {KlasaMessage} msg
// 	 * @param {{ message: string }} args
// 	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
// 	 * @memberof BotAnnounceCommand
// 	 */
// 	public async run(msg: KlasaMessage, args: {message: string}): Promise<KlasaMessage | KlasaMessage[]> {
// 		// let guildModels = await Bastion.database.models.guild.findAll({
// 		// 	attributes: [ 'announcementChannel' ]
// 		//   });
		
// 		//   let announcementChannels = guildModels.filter(guildModel => guildModel.dataValues.announcementChannel).map(guildModel => guildModel.dataValues.announcementChannel);
// 		//   let announcementMessage = args.join(' ');
		
// 		//   for (let channel of announcementChannels) {
// 		// 	if (Bastion.shard) {
// 		// 	  await Bastion.shard.broadcastEval(`
// 		// 		let channel = this.channels.get('${channel}');
// 		// 		if (channel) {
// 		// 		  channel.send({
// 		// 			embed: {
// 		// 			  color: this.colors.BLUE,
// 		// 			  description: \`${announcementMessage}\`
// 		// 			}
// 		// 		  }).catch(this.log.error);
// 		// 		}
// 		// 	  `);
// 		// 	}
// 		// 	else {
// 		// 	  await Bastion.channels.get(channel).send({
// 		// 		embed: {
// 		// 		  color: Bastion.colors.BLUE,
// 		// 		  description: announcementMessage
// 		// 		}
// 		// 	  }).catch(() => {});
// 		// 	}
// 		//   }
		
// 		//   await message.channel.send({
// 		// 	embed: {
// 		// 	  color: Bastion.colors.GREEN,
// 		// 	  title: 'Announced',
// 		// 	  description: announcementMessage
// 		// 	}
// 		//   }).catch(e => {
// 		// 	Bastion.log.error(e);
// 		//   });
// 	}
// }
